
import { supabase } from '@/integrations/supabase/client';
import { Customer, CustomerStatus } from '@/types/customer';
import { automationPerformanceService } from './automationPerformanceService';

interface SalesRep {
  id: string;
  name: string;
  email: string;
  department?: string;
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

interface AutomationRule {
  id: string;
  name: string;
  conditions: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  actions: Array<{
    type: string;
    config: any;
  }>;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface WorkflowDefinition {
  id: string;
  name: string;
  steps: Array<{
    type: string;
    config: any;
  }>;
}

interface NurturingReport {
  startDate: Date;
  endDate: Date;
  customers: Array<{
    id: string;
    name: string;
    email: string;
    status: CustomerStatus;
    lastInteraction: Date;
    engagementScore: number;
    predictedValue: number;
    recommendedActions: string[];
  }>;
  totalEngagementScore: number;
  averageEngagementScore: number;
  totalPredictedValue: number;
  averagePredictedValue: number;
  recommendedActions: string[];
}

export class LeadNurturingService {
  private static instance: LeadNurturingService;
  private automationRules: AutomationRule[] = [];
  private emailTemplates: EmailTemplate[] = [];
  private workflowDefinitions: WorkflowDefinition[] = [];

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
            notes: `${customer.notes ? customer.notes + '\n' : ''}Auto-assigned to ${bestRep.name}`
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

      // Send progression alert - simplified without assigned_to_email
      automationPerformanceService.addToBatch('email', {
        to: 'admin@company.com', // Fallback email
        template: 'status_progression_alert',
        data: { 
          customer, 
          oldStatus, 
          newStatus,
          nextSteps: this.getNextStepsForStatus(newStatus)
        }
      });

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
    // Use existing employee roles instead of non-existent 'sales_rep'
    const { data, error } = await supabase
      .from('employees')
      .select('id, first_name, last_name, email, department')
      .in('role', ['employee', 'manager']) // Use existing roles
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching sales reps:', error);
      return [];
    }

    return data?.map(rep => ({
      id: rep.id,
      name: `${rep.first_name} ${rep.last_name}`,
      email: rep.email,
      department: rep.department,
      currentWorkload: 0, // Default values since columns don't exist
      maxCapacity: 50
    })) || [];
  }

  private findBestSalesRep(customer: Customer, salesReps: SalesRep[]): SalesRep | null {
    // Filter by department if available (using department instead of territory)
    let availableReps = salesReps.filter(rep => 
      rep.department ? rep.department === 'sales' : true
    );

    // If no department match, use all reps
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
      .select('*')
      .eq('id', customerId)
      .single();

    if (error) {
      console.error('Error fetching customer:', error);
      return null;
    }

    // Convert Supabase data to Customer type
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      status: data.status as CustomerStatus,
      notes: data.notes || '',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      created_at: data.created_at,
      updated_at: data.updated_at,
      activeTickets: [],
      ticketCount: 0,
      assigned_to: undefined
    };
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

  private evaluateRules(customer: Customer): AutomationRule[] {
    return this.automationRules.filter(rule => {
      return rule.conditions.every(condition => {
        const value = this.getCustomerValue(customer, condition.field);
        return this.evaluateCondition(value, condition.operator, condition.value);
      });
    });
  }

  private evaluateCondition(value: any, operator: string, targetValue: any): boolean {
    switch (operator) {
      case 'equals':
        return value === targetValue;
      case 'contains':
        return value && value.toString().includes(targetValue);
      case 'greater_than':
        return Number(value) > Number(targetValue);
      case 'less_than':
        return Number(value) < Number(targetValue);
      default:
        return false;
    }
  }

  private getCustomerValue(customer: Customer, field: string): any {
    switch (field) {
      case 'status':
        return customer.status;
      case 'lastInteraction':
        return customer.updated_at;
      case 'createdAt':
        return customer.created_at;
      case 'email':
        return customer.email;
      case 'name':
        return customer.name;
      case 'phone':
        return customer.phone;
      case 'address':
        return customer.address;
      case 'notes':
        return customer.notes;
      case 'contact_person':
        return customer.contact_person;
      case 'company_address':
        return customer.company_address;
      case 'assigned_to':
        return customer.assigned_to || null;
      default:
        return null;
    }
  }

  private async getCustomersInRange(startDate: Date, endDate: Date): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) {
      console.error('Error fetching customers in range:', error);
      return [];
    }

    return data?.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      status: customer.status as CustomerStatus,
      notes: customer.notes || '',
      createdAt: new Date(customer.created_at),
      updatedAt: new Date(customer.updated_at),
      created_at: customer.created_at,
      updated_at: customer.updated_at,
      activeTickets: [],
      ticketCount: 0,
      assigned_to: undefined
    })) || [];
  }

  private async analyzeCustomerBehavior(customer: Customer): Promise<{
    engagementScore: number;
    recommendedActions: string[];
  }> {
    // Mock implementation
    const engagementScore = Math.random() * 100;
    const recommendedActions = ['Follow up within 24 hours', 'Send product demo'];
    
    return { engagementScore, recommendedActions };
  }

  private predictCustomerValue(customer: Customer): number {
    // Mock implementation
    return Math.random() * 10000;
  }

  async generateNurturingReport(startDate: Date, endDate: Date): Promise<NurturingReport> {
    const customers = await this.getCustomersInRange(startDate, endDate);
    const customerAnalysis = await Promise.all(
      customers.map(async (customer) => {
        const analysis = await this.analyzeCustomerBehavior(customer);
        const predictedValue = this.predictCustomerValue(customer);
        
        return {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          status: customer.status,
          lastInteraction: new Date(customer.updated_at),
          engagementScore: analysis.engagementScore,
          predictedValue,
          recommendedActions: analysis.recommendedActions,
        };
      })
    );

    const report: NurturingReport = {
      startDate,
      endDate,
      customers: customerAnalysis,
      totalEngagementScore: customerAnalysis.reduce((acc, curr) => acc + curr.engagementScore, 0),
      averageEngagementScore: customerAnalysis.length > 0 ? customerAnalysis.reduce((acc, curr) => acc + curr.engagementScore, 0) / customerAnalysis.length : 0,
      totalPredictedValue: customerAnalysis.reduce((acc, curr) => acc + curr.predictedValue, 0),
      averagePredictedValue: customerAnalysis.length > 0 ? customerAnalysis.reduce((acc, curr) => acc + curr.predictedValue, 0) / customerAnalysis.length : 0,
      recommendedActions: customerAnalysis.reduce((acc, curr) => acc.concat(curr.recommendedActions), [] as string[])
    };

    return report;
  }
}

export const leadNurturingService = new LeadNurturingService();
