
import { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import { toast } from '@/components/ui/use-toast';

export const useTicketManagement = () => {
  const { createTicket, updateTicketStatus, addTimeEntry } = useCRM();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateTicket = async (customerId: string, ticketData: any) => {
    setIsLoading(true);
    try {
      await createTicket({ ...ticketData, customerId });
      toast({
        title: "Success",
        description: "Ticket created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create ticket",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: string) => {
    setIsLoading(true);
    try {
      await updateTicketStatus(ticketId, status);
      toast({
        title: "Success",
        description: "Ticket status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTimeEntry = async (ticketId: string, timeEntry: any) => {
    setIsLoading(true);
    try {
      await addTimeEntry({ ...timeEntry, ticketId });
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
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleCreateTicket,
    handleUpdateTicketStatus,
    handleAddTimeEntry,
    isLoading,
  };
};
