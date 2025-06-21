
import { supabase } from '@/integrations/supabase/client';
import { Customer, CustomerStatus } from '@/types/customer';
import { automationPerformanceService } from './automationPerformanceService';

interface SalesRep {
  id: string;
  name: string;
  email: string;
  territory?: string;
  currentWorkload: number;
  maxCapacity: number;
}

interface FollowUpTask {
  id: string;
  customerId: string;
  type: 'follow_up' | 'status_check' | 'next_step';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  description: string;
  assignedTo: string;
}

export class LeadNurturingService {
  // Auto-assign new leads to sales reps
  async autoAssignLead(customer: Customer): Promise<string | null> {
    try {
      const salesReps = await this.getSalesReps();
      const bestRep = this.findBestSalesRep(customer, salesReps);
      
      if (bestRep) {
        // Update customer assignment
        const { error } = await supabase
          .from('customers')
          .update({ 
            assigned_to: bestRep.id,
            assigned_at: new Date().toISOString(),
            notes: `Auto-assigned to ${bestRep.name}`
          })
          .eq('id', customer.id);

        if (error) throw error;

        // Create welcome task
        await this.createWelcomeTask(customer, bestRep);
        
        // Send notification
        automationPerformanceService.addToBatch('email', {
          to: bestRep.email,
          template: 'new_lead_assignment',
          data: { customer, salesRep: bestRep }
        });

        console.log(`Lead ${customer.name} auto-assigned to ${bestRep.name}`);
        return bestRep.id;
      }
      
      return null;
    } catch (error) {
      console.error('Error auto-assigning lead:', error);
      return null;
    }
  }

  // Set up follow-up reminders for idle leads
  async setupFollowUpReminders(customerId: string): Promise<void> {
    const followUpSchedule = [
      { days: 3, priority: 'medium' as const, type: 'initial_follow_up' },
      { days: 7, priority: 'high' as const, type: 'second_follow_up' },
      { days: 14, priority: 'high' as const, type: 'final_follow_up' }
    ];

    for (const schedule of followUpSchedule) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + schedule.days);

      // Schedule follow-up automation
      automationPerformanceService.addJob({
        automationId: `follow_up_${customerId}_${schedule.days}`,
        type: 'trigger',
        data: {
          customerId,
          followUpType: schedule.type,
          priority: schedule.priority
        },
        priority: schedule.priority,
        scheduledAt: dueDate,
        maxRetries: 2
      });
    }

    console.log(`Follow-up reminders scheduled for customer ${customerId}`);
  }

  // Handle status progression alerts
  async handleStatusProgression(customerId: string, oldStatus: CustomerStatus, newStatus: CustomerStatus): Promise<void> {
    try {
      const customer = await this.getCustomer(customerId);
      if (!customer) return;

      // Create status change task
      await this.createStatusProgressionTask(customer, oldStatus, newStatus);

      // Send progression alert
      if (customer.assigned_to) {
        automationPerformanceService.addToBatch('email', {
          to: customer.assigned_to_email,
          template: 'status_progression_alert',
          data: { 
            customer, 
            oldStatus, 
            newStatus,
            nextSteps: this.getNextStepsForStatus(newStatus)
          }
        });
      }

      // Trigger next automation based on new status
      await this.triggerStatusBasedAutomation(customer, newStatus);

      console.log(`Status progression handled: ${customer.name} moved from ${oldStatus} to ${newStatus}`);
    } catch (error) {
      console.error('Error handling status progression:', error);
    }
  }

  // Auto-create tasks for next steps
  async createNextStepTasks(customer: Customer): Promise<void> {
    const nextSteps = this.getNextStepsForStatus(customer.status);
    
    for (const step of nextSteps) {
      const task: Omit<FollowUpTask, 'id'> = {
        customerId: customer.id,
        type: 'next_step',
        priority: step.priority,
        dueDate: step.dueDate,
        description: step.description,
        assignedTo: customer.assigned_to || 'unassigned'
      };

      await this.createTask(task);
    }

    console.log(`Next step tasks created for ${customer.name}`);
  }

  // Private helper methods
  private async getSalesReps(): Promise<SalesRep[]> {
    const { data, error } = await supabase
      .from('employees')
      .select('id, first_name, last_name, email, territory, current_workload, max_capacity')
      .eq('role', 'sales_rep')
      .eq('status', 'active');

    if (error) throw error;

    return data?.map(rep => ({
      id: rep.id,
      name: `${rep.first_name} ${rep.last_name}`,
      email: rep.email,
      territory: rep.territory,
      currentWorkload: rep.current_workload || 0,
      maxCapacity: rep.max_capacity || 50
    })) || [];
  }

  private findBestSalesRep(customer: Customer, salesReps: SalesRep[]): SalesRep | null {
    // Filter by territory if available
    let availableReps = salesReps.filter(rep => 
      rep.territory ? customer.territory === rep.territory : true
    );

    // If no territory match, use all reps
    if (availableReps.length === 0) {
      availableReps = salesReps;
    }

    // Filter by capacity
    availableReps = availableReps.filter(rep => 
      rep.currentWorkload < rep.maxCapacity
    );

    if (availableReps.length === 0) return null;

    // Sort by workload (ascending) to find least busy rep
    availableReps.sort((a, b) => a.currentWorkload - b.currentWorkload);

    return availableReps[0];
  }

  private async createWelcomeTask(customer: Customer, salesRep: SalesRep): Promise<void> {
    const task: Omit<FollowUpTask, 'id'> = {
      customerId: customer.id,
      type: 'next_step',
      priority: 'high',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      description: `Welcome new lead: ${customer.name}. Initial contact and needs assessment.`,
      assignedTo: salesRep.id
    };

    await this.createTask(task);
  }

  private async createStatusProgressionTask(customer: Customer, oldStatus: CustomerStatus, newStatus: CustomerStatus): Promise<void> {
    const task: Omit<FollowUpTask, 'id'> = {
      customerId: customer.id,
      type: 'status_check',
      priority: 'medium',
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      description: `Follow up on status change from ${oldStatus} to ${newStatus}`,
      assignedTo: customer.assigned_to || 'unassigned'
    };

    await this.createTask(task);
  }

  private getNextStepsForStatus(status: CustomerStatus): Array<{
    priority: 'low' | 'medium' | 'high';
    dueDate: Date;
    description: string;
  }> {
    const now = new Date();
    
    switch (status) {
      case 'new':
        return [
          {
            priority: 'high',
            dueDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
            description: 'Initial contact and qualification call'
          }
        ];
      case 'existing':
        return [
          {
            priority: 'medium',
            dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
            description: 'Needs assessment and service presentation'
          }
        ];
      case 'pending':
        return [
          {
            priority: 'high',
            dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
            description: 'Follow up on pending decision'
          }
        ];
      case 'finalised':
        return [
          {
            priority: 'medium',
            dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            description: 'Post-sale follow up and satisfaction check'
          }
        ];
      default:
        return [];
    }
  }

  private async triggerStatusBasedAutomation(customer: Customer, newStatus: CustomerStatus): Promise<void> {
    // Trigger different automations based on status
    switch (newStatus) {
      case 'new':
        await this.setupFollowUpReminders(customer.id);
        break;
      case 'pending':
        // Set up decision follow-up
        automationPerformanceService.addJob({
          automationId: `pending_decision_${customer.id}`,
          type: 'trigger',
          data: { customerId: customer.id, type: 'pending_decision' },
          priority: 'high',
          scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
          maxRetries: 2
        });
        break;
      case 'finalised':
        // Trigger onboarding sequence
        automationPerformanceService.addJob({
          automationId: `onboarding_${customer.id}`,
          type: 'trigger',
          data: { customerId: customer.id, type: 'onboarding' },
          priority: 'medium',
          maxRetries: 3
        });
        break;
    }
  }

  private async getCustomer(customerId: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*, assigned_to_email:employees(email)')
      .eq('id', customerId)
      .single();

    if (error) {
      console.error('Error fetching customer:', error);
      return null;
    }

    return data as Customer;
  }

  private async createTask(task: Omit<FollowUpTask, 'id'>): Promise<void> {
    // In a real implementation, this would create a task in your task management system
    console.log('Creating task:', task);
    
    // For now, we'll add it to the automation queue for processing
    automationPerformanceService.addToBatch('database', {
      type: 'INSERT',
      table: 'tasks',
      data: {
        ...task,
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString()
      }
    });
  }
}

export const leadNurturingService = new LeadNurturingService();
