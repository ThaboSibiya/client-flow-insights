
import { useState } from 'react';
import { CustomerTicket, TicketStatus, useCRM } from '@/context/CRMContext';
import { TimeEntry } from '@/types/customer';
import { toast } from '@/hooks/use-toast';

export const useTicketManagement = () => {
  const { createTicket, updateTicketStatus, addTimeEntry } = useCRM();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCreateTicket = async (
    customerId: string, 
    ticketData: Omit<CustomerTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'> & { category?: string }
  ) => {
    setIsCreating(true);
    try {
      // Create the ticket
      await createTicket(customerId, ticketData);
      
      toast({
        title: "Success",
        description: "Ticket created successfully",
      });
      return true;
    } catch (error) {
      console.error('Error creating ticket:', error);
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
      await updateTicketStatus(ticketId, status);
      toast({
        title: "Success",
        description: `Ticket status updated to ${status}`,
      });
    } catch (error) {
      console.error('Error updating ticket status:', error);
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
    timeEntryData: Omit<TimeEntry, 'id' | 'ticketId' | 'createdAt'>
  ) => {
    try {
      await addTimeEntry(ticketId, timeEntryData);
      toast({
        title: "Success",
        description: "Time entry added successfully",
      });
    } catch (error) {
      console.error('Error adding time entry:', error);
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
