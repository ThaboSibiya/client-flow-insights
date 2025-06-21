
import { useState, useEffect } from 'react';
import { ticketRoutingService } from '@/services/ticketRoutingService';
import { toast } from '@/hooks/use-toast';

export const useTicketRouting = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [routingStats, setRoutingStats] = useState({
    assignedCount: 0,
    escalatedCount: 0,
    autoClosedCount: 0,
    totalProcessed: 0
  });

  // Auto-assign ticket based on priority and category
  const autoAssignTicket = async (ticketId: string, priority: string, category?: string) => {
    setIsProcessing(true);
    try {
      let assignee;
      
      if (category) {
        assignee = await ticketRoutingService.assignTicketBySkill(ticketId, category, priority);
      } else {
        assignee = await ticketRoutingService.assignTicketByPriority(ticketId, priority, category);
      }

      if (assignee) {
        toast({
          title: "Ticket Assigned",
          description: `Ticket automatically assigned to ${assignee.first_name} ${assignee.last_name}`,
        });
      }

      return assignee;
    } catch (error) {
      toast({
        title: "Assignment Failed",
        description: "Failed to auto-assign ticket",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Manually escalate ticket
  const escalateTicket = async (ticketId: string, reason: string) => {
    setIsProcessing(true);
    try {
      await ticketRoutingService.escalateTicket(ticketId, reason);
    } catch (error) {
      toast({
        title: "Escalation Failed",
        description: "Failed to escalate ticket",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Check for overdue tickets (run periodically)
  const checkOverdueTickets = async () => {
    try {
      await ticketRoutingService.checkAndEscalateOverdueTickets();
    } catch (error) {
      console.error('Error checking overdue tickets:', error);
    }
  };

  // Auto-close resolved tickets
  const autoCloseResolvedTickets = async () => {
    try {
      await ticketRoutingService.autoCloseResolvedTickets();
    } catch (error) {
      console.error('Error auto-closing tickets:', error);
    }
  };

  // Load routing statistics
  const loadRoutingStats = async () => {
    try {
      const stats = await ticketRoutingService.getRoutingStats();
      setRoutingStats(stats);
    } catch (error) {
      console.error('Error loading routing stats:', error);
    }
  };

  // Set up periodic checks
  useEffect(() => {
    loadRoutingStats();
    
    // Check for overdue tickets every 30 minutes
    const overdueInterval = setInterval(checkOverdueTickets, 30 * 60 * 1000);
    
    // Auto-close resolved tickets every hour
    const autoCloseInterval = setInterval(autoCloseResolvedTickets, 60 * 60 * 1000);

    return () => {
      clearInterval(overdueInterval);
      clearInterval(autoCloseInterval);
    };
  }, []);

  return {
    autoAssignTicket,
    escalateTicket,
    checkOverdueTickets,
    autoCloseResolvedTickets,
    loadRoutingStats,
    routingStats,
    isProcessing
  };
};
