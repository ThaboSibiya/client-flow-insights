
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface TicketRoutingRule {
  id: string;
  name: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category?: string;
  assigneeType: 'manager' | 'agent' | 'specialist';
  skillRequired?: string;
  escalationHours: number;
  autoCloseAfterHours?: number;
  isActive: boolean;
}

export interface AgentSkill {
  agentId: string;
  skill: string;
  level: 'beginner' | 'intermediate' | 'expert';
}

export interface TicketEscalation {
  ticketId: string;
  escalatedAt: Date;
  escalatedBy: string;
  reason: string;
  newAssignee?: string;
}

class TicketRoutingService {
  // Priority-based assignment
  async assignTicketByPriority(ticketId: string, priority: string, category?: string) {
    try {
      const { data: employees } = await supabase
        .from('employees')
        .select('*')
        .eq('status', 'active');

      if (!employees?.length) {
        throw new Error('No available employees found');
      }

      let assignee;
      
      if (priority === 'urgent') {
        // Assign to manager for urgent tickets
        assignee = employees.find(emp => emp.role === 'manager') || employees[0];
      } else {
        // Find available agent based on workload
        const { data: ticketCounts } = await supabase
          .from('tickets')
          .select('assigned_to_id, count(*)')
          .in('status', ['open', 'in-progress'])
          .not('assigned_to_id', 'is', null);

        const workloadMap = new Map();
        ticketCounts?.forEach((count: any) => {
          workloadMap.set(count.assigned_to_id, count.count);
        });

        // Find agent with lowest workload
        assignee = employees
          .filter(emp => emp.role === 'employee')
          .sort((a, b) => (workloadMap.get(a.id) || 0) - (workloadMap.get(b.id) || 0))[0];
      }

      if (assignee) {
        await this.assignTicket(ticketId, assignee.id, assignee.first_name + ' ' + assignee.last_name);
        
        // Create escalation timer if needed
        await this.createEscalationTimer(ticketId, priority);
      }

      return assignee;
    } catch (error) {
      console.error('Error in priority-based assignment:', error);
      throw error;
    }
  }

  // Skill-based routing
  async assignTicketBySkill(ticketId: string, category: string, priority: string) {
    try {
      // For demo purposes, we'll use a simple skill mapping
      const skillMap: Record<string, string> = {
        'technical': 'technical-support',
        'billing': 'billing',
        'sales': 'sales',
        'general': 'customer-service'
      };

      const requiredSkill = skillMap[category.toLowerCase()] || 'customer-service';

      const { data: employees } = await supabase
        .from('employees')
        .select('*')
        .eq('status', 'active');

      if (!employees?.length) {
        throw new Error('No available employees found');
      }

      // For now, we'll simulate skill-based assignment
      // In a real app, you'd have a separate skills table
      let assignee;
      
      if (priority === 'urgent') {
        assignee = employees.find(emp => emp.role === 'manager') || employees[0];
      } else {
        // Find specialist or experienced agent for the category
        assignee = employees.find(emp => 
          emp.department?.toLowerCase().includes(category.toLowerCase()) ||
          emp.designation?.toLowerCase().includes(category.toLowerCase())
        ) || employees.find(emp => emp.role === 'employee') || employees[0];
      }

      if (assignee) {
        await this.assignTicket(ticketId, assignee.id, assignee.first_name + ' ' + assignee.last_name);
        await this.createEscalationTimer(ticketId, priority);
      }

      return assignee;
    } catch (error) {
      console.error('Error in skill-based assignment:', error);
      throw error;
    }
  }

  // Assign ticket to specific agent
  private async assignTicket(ticketId: string, assigneeId: string, assigneeName: string) {
    const { error } = await supabase
      .from('tickets')
      .update({
        assigned_to_id: assigneeId,
        assigned_to_name: assigneeName,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId);

    if (error) {
      throw error;
    }

    // Log assignment activity
    await supabase
      .from('ticket_activities')
      .insert({
        ticket_id: ticketId,
        user_id: assigneeId,
        user_name: assigneeName,
        activity_type: 'assigned',
        description: `Ticket assigned to ${assigneeName}`,
        new_value: assigneeName
      });
  }

  // Create escalation timer
  private async createEscalationTimer(ticketId: string, priority: string) {
    const escalationHours = this.getEscalationHours(priority);
    const escalationTime = new Date();
    escalationTime.setHours(escalationTime.getHours() + escalationHours);

    // Store escalation info (in a real app, you'd use a job queue)
    localStorage.setItem(`escalation_${ticketId}`, JSON.stringify({
      ticketId,
      escalationTime: escalationTime.toISOString(),
      priority
    }));
  }

  private getEscalationHours(priority: string): number {
    switch (priority) {
      case 'urgent': return 1;
      case 'high': return 4;
      case 'medium': return 24;
      case 'low': return 72;
      default: return 24;
    }
  }

  // Check for overdue tickets and escalate
  async checkAndEscalateOverdueTickets() {
    try {
      const now = new Date();
      
      // Get all open tickets
      const { data: tickets } = await supabase
        .from('tickets')
        .select('*')
        .in('status', ['open', 'in-progress']);

      if (!tickets) return;

      for (const ticket of tickets) {
        const escalationData = localStorage.getItem(`escalation_${ticket.id}`);
        if (!escalationData) continue;

        const { escalationTime } = JSON.parse(escalationData);
        if (new Date(escalationTime) <= now) {
          await this.escalateTicket(ticket.id, 'Automatic escalation due to timeout');
        }
      }
    } catch (error) {
      console.error('Error checking overdue tickets:', error);
    }
  }

  // Escalate ticket
  async escalateTicket(ticketId: string, reason: string) {
    try {
      // Find current assignee and escalate to manager
      const { data: ticket } = await supabase
        .from('tickets')
        .select('*, assigned_to_id')
        .eq('id', ticketId)
        .single();

      if (!ticket) return;

      // Find a manager to escalate to
      const { data: managers } = await supabase
        .from('employees')
        .select('*')
        .eq('role', 'manager')
        .eq('status', 'active')
        .limit(1);

      if (managers?.length) {
        const manager = managers[0];
        await this.assignTicket(ticketId, manager.id, manager.first_name + ' ' + manager.last_name);

        // Update priority if not already urgent
        if (ticket.priority !== 'urgent') {
          await supabase
            .from('tickets')
            .update({ priority: 'high' })
            .eq('id', ticketId);
        }

        // Log escalation
        await supabase
          .from('ticket_activities')
          .insert({
            ticket_id: ticketId,
            user_id: manager.id,
            user_name: manager.first_name + ' ' + manager.last_name,
            activity_type: 'escalated',
            description: `Ticket escalated: ${reason}`,
            old_value: ticket.assigned_to_name,
            new_value: manager.first_name + ' ' + manager.last_name
          });

        toast({
          title: "Ticket Escalated",
          description: `Ticket #${ticket.ticket_number} has been escalated to ${manager.first_name} ${manager.last_name}`,
        });
      }
    } catch (error) {
      console.error('Error escalating ticket:', error);
    }
  }

  // Auto-close resolved tickets after customer confirmation timeout
  async autoCloseResolvedTickets() {
    try {
      const autoCloseHours = 72; // 3 days default
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - autoCloseHours);

      const { data: resolvedTickets } = await supabase
        .from('tickets')
        .select('*')
        .eq('status', 'resolved')
        .lt('resolved_at', cutoffTime.toISOString());

      if (!resolvedTickets?.length) return;

      for (const ticket of resolvedTickets) {
        await supabase
          .from('tickets')
          .update({
            status: 'closed',
            closed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', ticket.id);

        // Log auto-close activity
        await supabase
          .from('ticket_activities')
          .insert({
            ticket_id: ticket.id,
            user_id: ticket.user_id,
            user_name: 'System',
            activity_type: 'auto-closed',
            description: 'Ticket automatically closed after resolution confirmation timeout',
            old_value: 'resolved',
            new_value: 'closed'
          });
      }

      if (resolvedTickets.length > 0) {
        toast({
          title: "Tickets Auto-Closed",
          description: `${resolvedTickets.length} resolved tickets have been automatically closed`,
        });
      }
    } catch (error) {
      console.error('Error auto-closing tickets:', error);
    }
  }

  // Get routing statistics
  async getRoutingStats() {
    try {
      const { data: stats } = await supabase
        .from('ticket_activities')
        .select('*')
        .in('activity_type', ['assigned', 'escalated', 'auto-closed'])
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const assignedCount = stats?.filter(s => s.activity_type === 'assigned').length || 0;
      const escalatedCount = stats?.filter(s => s.activity_type === 'escalated').length || 0;
      const autoClosedCount = stats?.filter(s => s.activity_type === 'auto-closed').length || 0;

      return {
        assignedCount,
        escalatedCount,
        autoClosedCount,
        totalProcessed: assignedCount + escalatedCount + autoClosedCount
      };
    } catch (error) {
      console.error('Error getting routing stats:', error);
      return {
        assignedCount: 0,
        escalatedCount: 0,
        autoClosedCount: 0,
        totalProcessed: 0
      };
    }
  }
}

export const ticketRoutingService = new TicketRoutingService();
