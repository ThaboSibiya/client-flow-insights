
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Customer } from '@/components/customers/onsite/types';
import { CustomerStatus } from '@/types/customer';
import { logSecurityEvent, sanitizeInput } from '@/services/securityService';

export const useSecureJobCompletion = () => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (
    selectedCustomer: Customer,
    newStatus: CustomerStatus,
    notes: string,
    location: { lat: number; lng: number } | null
  ) => {
    if (!selectedCustomer) {
      toast({
        title: "Error",
        description: "Please select a customer first",
        variant: "destructive"
      });
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

      console.log('Submitting job completion for customer:', selectedCustomer.id);

      // Verify customer ownership first
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

      // Check if user has permission to update this customer
      if (customer.user_id !== user.id) {
        await logSecurityEvent({
          action: 'unauthorized_customer_update',
          resource_type: 'customers',
          resource_id: selectedCustomer.id,
          success: false,
          error_message: 'User does not own this customer'
        });
        throw new Error('Unauthorized access to customer');
      }

      // Get employee ID securely
      let employeeId = null;
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (employee) {
        employeeId = employee.id;
        console.log('Found employee ID:', employeeId);
      } else {
        console.log('No employee record found');
      }

      // Sanitize and validate inputs
      const sanitizedNotes = sanitizeInput(notes, 1000);
      
      // Validate location coordinates if provided
      if (location) {
        if (location.lat < -90 || location.lat > 90 || location.lng < -180 || location.lng > 180) {
          throw new Error('Invalid location coordinates');
        }
      }

      // Update customer status with proper validation
      const { error: updateError } = await supabase
        .from('customers')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedCustomer.id)
        .eq('user_id', user.id); // Double-check ownership in update

      if (updateError) {
        await logSecurityEvent({
          action: 'customer_update_failed',
          resource_type: 'customers',
          resource_id: selectedCustomer.id,
          success: false,
          error_message: updateError.message
        });
        throw updateError;
      }

      console.log('Customer status updated successfully');

      // Record job completion with validated data
      const jobCompletionData = {
        customer_id: selectedCustomer.id,
        employee_id: employeeId,
        notes: sanitizedNotes || null,
        before_status: selectedCustomer.status,
        after_status: newStatus,
        location_lat: location?.lat || null,
        location_lng: location?.lng || null
      };

      console.log('Inserting job completion:', jobCompletionData);

      const { error: jobError } = await supabase
        .from('job_completions')
        .insert(jobCompletionData);

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
        title: "Success",
        description: `Job completed! Customer status updated to ${newStatus}`,
      });

      return true;
    } catch (error: any) {
      console.error('Error updating status:', error);
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

  return {
    submitting,
    handleSubmit
  };
};
