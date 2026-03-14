import { supabase } from '@/integrations/supabase/client';
import { CustomerTicket, TicketStatus } from '@/types/customer';
import { toast } from '@/components/ui/use-toast';
import { logSecurityEvent, sanitizeInput } from './securityService';

export const createTicket = async (
  customerId: string,
  ticketData: Omit<CustomerTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>,
  userId: string,
  workspaceId?: string | null
) => {
  if (!userId) {
    await logSecurityEvent({
      action: 'unauthorized_ticket_create',
      resource_type: 'tickets',
      success: false,
      error_message: 'No user ID provided'
    });
    toast({
      title: "Error",
      description: "You must be logged in to create tickets",
      variant: "destructive",
    });
    return null;
  }

  try {
    const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`;
    
    const sanitizedData = {
      customer_id: customerId,
      user_id: userId,
      ticket_number: ticketNumber,
      subject: sanitizeInput(ticketData.subject, 200),
      description: sanitizeInput(ticketData.description || '', 1000),
      priority: ticketData.priority,
      status: ticketData.status,
      assigned_to_id: ticketData.assignedTo?.id || null,
      assigned_to_name: ticketData.assignedTo?.name || null,
    };

    const { data, error } = await supabase
      .from('tickets')
      .insert([sanitizedData])
      .select('*')
      .single();

    if (error) {
      console.error("Supabase error creating ticket:", error);
      await logSecurityEvent({
        action: 'ticket_create_failed',
        resource_type: 'tickets',
        success: false,
        error_message: error.message
      });
      throw error;
    }

    if (data) {
      const newTicket: CustomerTicket = {
        id: data.id,
        ticketNumber: data.ticket_number,
        subject: data.subject,
        description: data.description || '',
        priority: data.priority as 'low' | 'medium' | 'high' | 'urgent',
        status: data.status as TicketStatus,
        assignedTo: data.assigned_to_name ? {
          id: data.assigned_to_id,
          name: data.assigned_to_name,
          email: '',
          role: 'employee'
        } : undefined,
        timeEntries: [],
        totalTimeSpent: 0,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      await logSecurityEvent({
        action: 'ticket_created',
        resource_type: 'tickets',
        resource_id: data.id,
        success: true
      });

      toast({
        title: "Success",
        description: "Ticket created successfully",
      });

      return newTicket;
    }

    return null;
  } catch (error: any) {
    console.error('Error creating ticket:', error.message);
    await logSecurityEvent({
      action: 'ticket_create_error',
      resource_type: 'tickets',
      success: false,
      error_message: error.message
    });
    toast({
      title: "Error",
      description: `Failed to create ticket: ${error.message}`,
      variant: "destructive",
    });
    return null;
  }
};

export const updateTicketStatus = async (
  ticketId: string,
  status: TicketStatus,
  userId: string
) => {
  if (!userId) {
    await logSecurityEvent({
      action: 'unauthorized_ticket_status_update',
      resource_type: 'tickets',
      resource_id: ticketId,
      success: false,
      error_message: 'No user ID provided'
    });
    return false;
  }

  try {
    // Verify ownership before update
    const { data: existingTicket } = await supabase
      .from('tickets')
      .select('user_id')
      .eq('id', ticketId)
      .single();

    if (!existingTicket || existingTicket.user_id !== userId) {
      await logSecurityEvent({
        action: 'unauthorized_ticket_update',
        resource_type: 'tickets',
        resource_id: ticketId,
        success: false,
        error_message: 'Ticket not found or access denied'
      });
      toast({
        title: "Error",
        description: "Ticket not found or access denied",
        variant: "destructive",
      });
      return false;
    }

    const { error } = await supabase
      .from('tickets')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId)
      .eq('user_id', userId);

    if (error) {
      await logSecurityEvent({
        action: 'ticket_status_update_failed',
        resource_type: 'tickets',
        resource_id: ticketId,
        success: false,
        error_message: error.message
      });
      throw error;
    }

    await logSecurityEvent({
      action: 'ticket_status_updated',
      resource_type: 'tickets',
      resource_id: ticketId,
      success: true
    });

    toast({
      title: "Success",
      description: "Ticket status updated",
    });

    return true;
  } catch (error: any) {
    console.error('Error updating ticket status:', error.message);
    toast({
      title: "Error",
      description: "Failed to update ticket status",
      variant: "destructive",
    });
    return false;
  }
};

export const updateTicket = async (
  ticketId: string,
  ticketData: Partial<CustomerTicket>,
  userId: string
) => {
  if (!userId) return false;

  try {
    // Verify ownership before update
    const { data: existingTicket } = await supabase
      .from('tickets')
      .select('user_id')
      .eq('id', ticketId)
      .single();

    if (!existingTicket || existingTicket.user_id !== userId) {
      await logSecurityEvent({
        action: 'unauthorized_ticket_update',
        resource_type: 'tickets',
        resource_id: ticketId,
        success: false,
        error_message: 'Ticket not found or access denied'
      });
      return false;
    }

    // Transform data for database
    const dbData: any = {
      updated_at: new Date().toISOString()
    };

    if (ticketData.subject) dbData.subject = sanitizeInput(ticketData.subject, 200);
    if (ticketData.description) dbData.description = sanitizeInput(ticketData.description, 1000);
    if (ticketData.priority) dbData.priority = ticketData.priority;
    if (ticketData.status) dbData.status = ticketData.status;
    if (ticketData.assignedTo) {
      dbData.assigned_to_id = ticketData.assignedTo.id;
      dbData.assigned_to_name = ticketData.assignedTo.name;
    }

    const { error } = await supabase
      .from('tickets')
      .update(dbData)
      .eq('id', ticketId)
      .eq('user_id', userId);

    if (error) throw error;

    await logSecurityEvent({
      action: 'ticket_updated',
      resource_type: 'tickets',
      resource_id: ticketId,
      success: true
    });

    toast({
      title: "Success",
      description: "Ticket updated successfully",
    });

    return true;
  } catch (error: any) {
    console.error('Error updating ticket:', error.message);
    await logSecurityEvent({
      action: 'ticket_update_error',
      resource_type: 'tickets',
      resource_id: ticketId,
      success: false,
      error_message: error.message
    });
    toast({
      title: "Error",
      description: "Failed to update ticket",
      variant: "destructive",
    });
    return false;
  }
};
