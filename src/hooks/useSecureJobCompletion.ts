import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Customer, OnSiteTicket, JobPhoto } from '@/components/customers/onsite/types';
import { CustomerStatus } from '@/types/customer';
import { logSecurityEvent, sanitizeInput } from '@/services/secureSecurityService';
import { ticketEventBus, TICKET_EVENTS } from '@/stores/ticketEventBus';

interface JobCompletionPayload {
  selectedCustomer: Customer;
  newStatus: CustomerStatus;
  notes: string;
  workSummary: string;
  location: { lat: number; lng: number } | null;
  selectedTicket: OnSiteTicket | null;
  photos: JobPhoto[];
}

export const useSecureJobCompletion = () => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (payload: JobCompletionPayload) => {
    const { selectedCustomer, newStatus, notes, workSummary, location, selectedTicket, photos } = payload;

    if (!selectedCustomer) {
      toast({ title: "Error", description: "Please select a customer first", variant: "destructive" });
      return false;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        await logSecurityEvent({
          action: 'unauthorized_job_completion',
          resource_type: 'job_completions',
          resource_id: selectedCustomer.id,
          success: false,
          error_message: 'User not authenticated'
        });
        throw new Error('User not authenticated');
      }

      // Verify customer ownership
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('user_id')
        .eq('id', selectedCustomer.id)
        .single();

      if (customerError || !customer) {
        await logSecurityEvent({
          action: 'customer_verification_failed',
          resource_type: 'customers',
          resource_id: selectedCustomer.id,
          success: false,
          error_message: 'Customer not found or access denied'
        });
        throw new Error('Customer verification failed');
      }

      if (customer.user_id !== user.id) {
        // Check if user is an employee of the owner
        const { data: emp } = await supabase
          .from('employees')
          .select('company_owner_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!emp || emp.company_owner_id !== customer.user_id) {
          await logSecurityEvent({
            action: 'unauthorized_customer_update',
            resource_type: 'customers',
            resource_id: selectedCustomer.id,
            success: false,
            error_message: 'User does not own this customer'
          });
          throw new Error('Unauthorized access to customer');
        }
      }

      // Get employee ID
      let employeeId: string | null = null;
      const { data: employee } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .eq('user_id', user.id)
        .maybeSingle();

      if (employee) {
        employeeId = employee.id;
      }

      // Sanitize inputs
      const sanitizedNotes = sanitizeInput(notes, 1000);
      const sanitizedSummary = sanitizeInput(workSummary, 500);

      // Validate location
      if (location) {
        if (location.lat < -90 || location.lat > 90 || location.lng < -180 || location.lng > 180) {
          throw new Error('Invalid location coordinates');
        }
      }

      // 1. Update customer status
      const { error: updateError } = await supabase
        .from('customers')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedCustomer.id);

      if (updateError) throw updateError;

      // 2. If a ticket is linked, resolve it
      if (selectedTicket) {
        const { error: ticketError } = await supabase
          .from('tickets')
          .update({
            status: 'resolved',
            resolved_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedTicket.id);

        if (ticketError) {
          console.error('Failed to update ticket:', ticketError);
        } else {
          // Log ticket activity
          if (employee) {
            await supabase.from('ticket_activities').insert({
              ticket_id: selectedTicket.id,
              user_id: employee.id,
              user_name: `${employee.first_name} ${employee.last_name}`,
              activity_type: 'status_change',
              description: `Resolved via job completion`,
              old_value: selectedTicket.status,
              new_value: 'resolved',
            });

            if (sanitizedNotes) {
              await supabase.from('ticket_comments').insert({
                ticket_id: selectedTicket.id,
                user_id: user.id,
                user_name: `${employee.first_name} ${employee.last_name}`,
                comment: sanitizedNotes,
                is_internal: false,
              });
            }
          }

          // Emit ticket events for cross-page sync
          ticketEventBus.emit(TICKET_EVENTS.TICKET_STATUS_CHANGED, {
            ticketId: selectedTicket.id,
            status: 'resolved',
            customerId: selectedCustomer.id,
          });
          ticketEventBus.emit(TICKET_EVENTS.TICKET_UPDATED, {
            ticketId: selectedTicket.id,
            customerId: selectedCustomer.id,
          });
          ticketEventBus.emit(TICKET_EVENTS.CUSTOMER_TICKETS_REFRESH, {
            customerId: selectedCustomer.id,
          });
          ticketEventBus.emit(TICKET_EVENTS.PIPELINE_REFRESH);
        }
      }

      // 3. Record job completion with photos and ticket link
      const photosData = photos.map(p => ({
        id: p.id,
        name: p.name,
        path: p.path,
        url: p.url,
        type: p.type,
      }));

      const { error: jobError } = await supabase
        .from('job_completions')
        .insert({
          customer_id: selectedCustomer.id,
          employee_id: employeeId,
          notes: sanitizedNotes || null,
          work_summary: sanitizedSummary || null,
          before_status: selectedCustomer.status,
          after_status: newStatus,
          location_lat: location?.lat || null,
          location_lng: location?.lng || null,
          ticket_id: selectedTicket?.id || null,
          photos: photosData,
        });

      if (jobError) {
        await logSecurityEvent({
          action: 'job_completion_insert_failed',
          resource_type: 'job_completions',
          resource_id: selectedCustomer.id,
          success: false,
          error_message: jobError.message
        });
        throw jobError;
      }

      await logSecurityEvent({
        action: 'job_completion_success',
        resource_type: 'job_completions',
        resource_id: selectedCustomer.id,
        success: true
      });

      toast({
        title: "Job completed",
        description: selectedTicket
          ? `Status updated & ticket ${selectedTicket.ticket_number} resolved`
          : `Customer status updated to ${newStatus}`,
      });

      return true;
    } catch (error: any) {
      console.error('Error completing job:', error);
      await logSecurityEvent({
        action: 'job_completion_error',
        resource_type: 'job_completions',
        resource_id: selectedCustomer.id,
        success: false,
        error_message: error.message
      });
      toast({
        title: "Error",
        description: `Failed to complete job: ${error.message}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, handleSubmit };
};
