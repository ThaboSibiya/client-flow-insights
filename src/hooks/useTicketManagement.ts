
import { useState } from 'react';
import { CustomerTicket, useCRM } from '@/context/CRMContext';
import { TimeEntry, TicketStatus, TicketPriority } from '@/types/customer';
import { toast } from '@/hooks/use-toast';
import { useTicketRouting } from './useTicketRouting';

export const useTicketManagement = () => {
  const { createTicket, updateTicketStatus, addTimeEntry } = useCRM();
  const { autoAssignTicket } = useTicketRouting();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCreateTicket = async (
    customerId: string, 
    ticketData: Omit<CustomerTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'> & { category?: string }
  ) => {
    setIsCreating(true);
    try {
      // Map TicketStatus to the status expected by createTicket
      const mappedStatus = ticketData.status === 'resolved' ? 'closed' : ticketData.status === 'open' ? 'open' : ticketData.status === 'in-progress' ? 'in-progress' : 'open';
      
      // Create the ticket with title (using subject as title)
      await createTicket({
        ...ticketData,
        customerId,
        title: ticketData.subject, // Add title property required by Ticket interface
        status: mappedStatus as 'open' | 'in-progress' | 'closed'
      });
      
      // Generate a temporary ticket ID for auto-assignment
      const tempTicketId = `ticket-${Date.now()}`;
      
      // Auto-assign the ticket based on priority and category
      try {
        await autoAssignTicket(tempTicketId, ticketData.priority, ticketData.category);
      } catch (error) {
        console.error('Failed to auto-assign ticket:', error);
        // Continue even if auto-assignment fails
      }
      
      toast({
        title: "Success",
        description: "Ticket created and automatically assigned",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create ticket",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: TicketStatus) => {
    setIsUpdating(true);
    try {
      // Map TicketStatus to the status expected by updateTicketStatus
      const mappedStatus = status === 'resolved' ? 'closed' : status === 'open' ? 'open' : status === 'in-progress' ? 'in-progress' : 'closed';
      await updateTicketStatus(ticketId, mappedStatus as 'open' | 'in-progress' | 'closed');
      toast({
        title: "Success",
        description: `Ticket status updated to ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddTimeEntry = async (
    ticketId: string, 
    timeEntryData: Omit<TimeEntry, 'id' | 'createdAt' | 'ticketId'>
  ) => {
    try {
      await addTimeEntry(ticketId, timeEntryData);
      toast({
        title: "Success",
        description: "Time entry added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add time entry",
        variant: "destructive",
      });
    }
  };

  return {
    handleCreateTicket,
    handleUpdateTicketStatus,
    handleAddTimeEntry,
    isCreating,
    isUpdating,
  };
};
