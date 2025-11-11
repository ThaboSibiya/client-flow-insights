
import { useState } from 'react';
import { CustomerTicket, TicketStatus, useCRM } from '@/context/CRMContext';
import { TimeEntry } from '@/types/customer';
import { toast } from '@/hooks/use-toast';
import { ticketEventBus, TICKET_EVENTS } from '@/stores/ticketEventBus';

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
      const newTicket = await createTicket(customerId, ticketData);
      
      // Emit ticket created event
      ticketEventBus.emit(TICKET_EVENTS.TICKET_CREATED, { 
        customerId, 
        ticket: newTicket 
      });
      ticketEventBus.emit(TICKET_EVENTS.CUSTOMER_TICKETS_REFRESH, { customerId });
      ticketEventBus.emit(TICKET_EVENTS.PIPELINE_REFRESH);
      
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

  const handleUpdateTicketStatus = async (ticketId: string, status: TicketStatus, customerId?: string) => {
    setIsUpdating(true);
    try {
      await updateTicketStatus(ticketId, status);
      
      // Emit status change event
      ticketEventBus.emit(TICKET_EVENTS.TICKET_STATUS_CHANGED, { 
        ticketId, 
        status,
        customerId 
      });
      ticketEventBus.emit(TICKET_EVENTS.TICKET_UPDATED, { ticketId, customerId });
      if (customerId) {
        ticketEventBus.emit(TICKET_EVENTS.CUSTOMER_TICKETS_REFRESH, { customerId });
      }
      ticketEventBus.emit(TICKET_EVENTS.PIPELINE_REFRESH);
      
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
    timeEntryData: Omit<TimeEntry, 'id' | 'ticketId' | 'createdAt'>,
    customerId?: string
  ) => {
    try {
      await addTimeEntry(ticketId, timeEntryData);
      
      // Emit time entry added event
      ticketEventBus.emit(TICKET_EVENTS.TIME_ENTRY_ADDED, { 
        ticketId, 
        timeEntry: timeEntryData,
        customerId 
      });
      ticketEventBus.emit(TICKET_EVENTS.TICKET_UPDATED, { ticketId, customerId });
      
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
