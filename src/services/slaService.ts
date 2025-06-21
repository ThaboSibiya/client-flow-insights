
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SLAConfig {
  priority: 'urgent' | 'high' | 'medium' | 'low';
  responseTimeHours: number;
  resolutionTimeHours: number;
  escalationTimeHours: number;
}

export interface SLAStatus {
  ticketId: string;
  priority: string;
  responseDeadline: Date;
  resolutionDeadline: Date;
  escalationDeadline: Date;
  responseStatus: 'met' | 'at-risk' | 'breached';
  resolutionStatus: 'met' | 'at-risk' | 'breached';
  timeToResponse?: number; // minutes remaining
  timeToResolution?: number; // minutes remaining
  breachNotificationSent: boolean;
}

export interface SLAMetrics {
  totalTickets: number;
  responseSLAMet: number;
  resolutionSLAMet: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  breachedTickets: number;
  atRiskTickets: number;
}

class SLAService {
  private slaConfigs: Record<string, SLAConfig> = {
    urgent: { priority: 'urgent', responseTimeHours: 1, resolutionTimeHours: 4, escalationTimeHours: 0.5 },
    high: { priority: 'high', responseTimeHours: 4, resolutionTimeHours: 24, escalationTimeHours: 2 },
    medium: { priority: 'medium', responseTimeHours: 8, resolutionTimeHours: 72, escalationTimeHours: 4 },
    low: { priority: 'low', responseTimeHours: 24, resolutionTimeHours: 168, escalationTimeHours: 12 }
  };

  private notificationsSent = new Set<string>();

  // Get SLA configuration for a priority level
  getSLAConfig(priority: string): SLAConfig {
    return this.slaConfigs[priority.toLowerCase()] || this.slaConfigs.medium;
  }

  // Calculate SLA status for a ticket
  calculateSLAStatus(ticket: any): SLAStatus {
    const config = this.getSLAConfig(ticket.priority);
    const createdAt = new Date(ticket.created_at);
    const now = new Date();
    
    const responseDeadline = new Date(createdAt.getTime() + config.responseTimeHours * 60 * 60 * 1000);
    const resolutionDeadline = new Date(createdAt.getTime() + config.resolutionTimeHours * 60 * 60 * 1000);
    const escalationDeadline = new Date(createdAt.getTime() + config.escalationTimeHours * 60 * 60 * 1000);

    const timeToResponse = Math.max(0, (responseDeadline.getTime() - now.getTime()) / (1000 * 60));
    const timeToResolution = Math.max(0, (resolutionDeadline.getTime() - now.getTime()) / (1000 * 60));

    // Determine status based on time remaining
    const getStatus = (deadline: Date, hasResponse: boolean = false) => {
      const timeLeft = deadline.getTime() - now.getTime();
      const totalTime = deadline.getTime() - createdAt.getTime();
      const percentRemaining = timeLeft / totalTime;

      if (timeLeft <= 0) return 'breached';
      if (percentRemaining <= 0.25) return 'at-risk'; // Less than 25% time remaining
      if (hasResponse) return 'met';
      return 'met';
    };

    const hasResponse = ticket.status !== 'open'; // Assume any status change indicates response
    const isResolved = ['resolved', 'closed'].includes(ticket.status);

    return {
      ticketId: ticket.id,
      priority: ticket.priority,
      responseDeadline,
      resolutionDeadline,
      escalationDeadline,
      responseStatus: hasResponse ? 'met' : getStatus(responseDeadline),
      resolutionStatus: isResolved ? 'met' : getStatus(resolutionDeadline),
      timeToResponse,
      timeToResolution,
      breachNotificationSent: this.notificationsSent.has(`${ticket.id}_breach`)
    };
  }

  // Get SLA metrics for performance tracking
  async getSLAMetrics(dateRange?: { start: Date; end: Date }): Promise<SLAMetrics> {
    try {
      let query = supabase
        .from('tickets')
        .select('*');

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start.toISOString())
          .lte('created_at', dateRange.end.toISOString());
      }

      const { data: tickets } = await query;

      if (!tickets) {
        return {
          totalTickets: 0,
          responseSLAMet: 0,
          resolutionSLAMet: 0,
          averageResponseTime: 0,
          averageResolutionTime: 0,
          breachedTickets: 0,
          atRiskTickets: 0
        };
      }

      let responseSLAMet = 0;
      let resolutionSLAMet = 0;
      let breachedTickets = 0;
      let atRiskTickets = 0;
      let totalResponseTime = 0;
      let totalResolutionTime = 0;
      let resolvedTicketsCount = 0;

      tickets.forEach(ticket => {
        const slaStatus = this.calculateSLAStatus(ticket);
        
        if (slaStatus.responseStatus === 'met') responseSLAMet++;
        if (slaStatus.resolutionStatus === 'met') resolutionSLAMet++;
        if (slaStatus.responseStatus === 'breached' || slaStatus.resolutionStatus === 'breached') breachedTickets++;
        if (slaStatus.responseStatus === 'at-risk' || slaStatus.resolutionStatus === 'at-risk') atRiskTickets++;

        // Calculate actual response and resolution times
        if (ticket.updated_at && ticket.created_at) {
          const responseTime = (new Date(ticket.updated_at).getTime() - new Date(ticket.created_at).getTime()) / (1000 * 60);
          totalResponseTime += responseTime;
        }

        if (ticket.resolved_at && ticket.created_at) {
          const resolutionTime = (new Date(ticket.resolved_at).getTime() - new Date(ticket.created_at).getTime()) / (1000 * 60);
          totalResolutionTime += resolutionTime;
          resolvedTicketsCount++;
        }
      });

      return {
        totalTickets: tickets.length,
        responseSLAMet,
        resolutionSLAMet,
        averageResponseTime: tickets.length > 0 ? totalResponseTime / tickets.length : 0,
        averageResolutionTime: resolvedTicketsCount > 0 ? totalResolutionTime / resolvedTicketsCount : 0,
        breachedTickets,
        atRiskTickets
      };
    } catch (error) {
      console.error('Error calculating SLA metrics:', error);
      throw error;
    }
  }

  // Check for SLA breaches and send notifications
  async checkSLABreaches(): Promise<void> {
    try {
      const { data: tickets } = await supabase
        .from('tickets')
        .select('*')
        .in('status', ['open', 'in-progress']);

      if (!tickets) return;

      for (const ticket of tickets) {
        const slaStatus = this.calculateSLAStatus(ticket);
        
        // Send breach notification if SLA is at risk or breached
        if (slaStatus.responseStatus === 'at-risk' || slaStatus.resolutionStatus === 'at-risk') {
          await this.sendSLAWarning(ticket, slaStatus);
        }

        if (slaStatus.responseStatus === 'breached' || slaStatus.resolutionStatus === 'breached') {
          await this.sendSLABreach(ticket, slaStatus);
        }
      }
    } catch (error) {
      console.error('Error checking SLA breaches:', error);
    }
  }

  // Send SLA warning notification
  private async sendSLAWarning(ticket: any, slaStatus: SLAStatus): Promise<void> {
    const warningKey = `${ticket.id}_warning`;
    if (this.notificationsSent.has(warningKey)) return;

    try {
      // Notify team managers
      await this.notifyManagers({
        type: 'sla_warning',
        ticketId: ticket.id,
        ticketNumber: ticket.ticket_number,
        priority: ticket.priority,
        timeToResponse: slaStatus.timeToResponse,
        timeToResolution: slaStatus.timeToResolution,
        message: `SLA Warning: Ticket ${ticket.ticket_number} is at risk of breaching SLA`
      });

      this.notificationsSent.add(warningKey);
      console.log(`SLA warning sent for ticket ${ticket.ticket_number}`);
    } catch (error) {
      console.error('Failed to send SLA warning:', error);
    }
  }

  // Send SLA breach notification
  private async sendSLABreach(ticket: any, slaStatus: SLAStatus): Promise<void> {
    const breachKey = `${ticket.id}_breach`;
    if (this.notificationsSent.has(breachKey)) return;

    try {
      // Notify team managers
      await this.notifyManagers({
        type: 'sla_breach',
        ticketId: ticket.id,
        ticketNumber: ticket.ticket_number,
        priority: ticket.priority,
        responseStatus: slaStatus.responseStatus,
        resolutionStatus: slaStatus.resolutionStatus,
        message: `SLA BREACH: Ticket ${ticket.ticket_number} has breached SLA requirements`
      });

      // Notify customer about delay
      if (ticket.customer_id) {
        await this.notifyCustomerAboutDelay(ticket);
      }

      this.notificationsSent.add(breachKey);
      
      toast({
        title: "SLA Breach Alert",
        description: `Ticket ${ticket.ticket_number} has breached SLA`,
        variant: "destructive",
      });

      console.log(`SLA breach notification sent for ticket ${ticket.ticket_number}`);
    } catch (error) {
      console.error('Failed to send SLA breach notification:', error);
    }
  }

  // Notify team managers about SLA issues
  private async notifyManagers(notification: any): Promise<void> {
    try {
      const { data: managers } = await supabase
        .from('employees')
        .select('*')
        .eq('role', 'manager')
        .eq('status', 'active');

      if (!managers?.length) return;

      // In a real app, you'd send actual notifications/emails
      // For now, we'll log and show toast notifications
      console.log('Manager notification:', notification);
      
      // Store notification in database for audit trail
      for (const manager of managers) {
        await supabase
          .from('ticket_activities')
          .insert({
            ticket_id: notification.ticketId,
            user_id: manager.id,
            user_name: manager.first_name + ' ' + manager.last_name,
            activity_type: notification.type,
            description: notification.message,
            new_value: JSON.stringify(notification)
          });
      }
    } catch (error) {
      console.error('Error notifying managers:', error);
    }
  }

  // Notify customer about resolution delays
  private async notifyCustomerAboutDelay(ticket: any): Promise<void> {
    try {
      const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', ticket.customer_id)
        .single();

      if (!customer) return;

      // In a real app, you'd send an email to the customer
      console.log(`Customer notification sent to ${customer.email} about ticket ${ticket.ticket_number} delay`);
      
      // Log the notification
      await supabase
        .from('ticket_activities')
        .insert({
          ticket_id: ticket.id,
          user_id: ticket.user_id,
          user_name: 'System',
          activity_type: 'customer_notified',
          description: `Customer ${customer.name} notified about resolution delay`,
          new_value: customer.email
        });
    } catch (error) {
      console.error('Error notifying customer about delay:', error);
    }
  }

  // Format time remaining for display
  formatTimeRemaining(minutes: number): string {
    if (minutes <= 0) return 'Overdue';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.floor(minutes % 60);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    } else if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    } else {
      return `${remainingMinutes}m`;
    }
  }

  // Get status color for UI
  getStatusColor(status: 'met' | 'at-risk' | 'breached'): string {
    switch (status) {
      case 'met': return 'text-green-600 bg-green-100';
      case 'at-risk': return 'text-orange-600 bg-orange-100';
      case 'breached': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }
}

export const slaService = new SLAService();
