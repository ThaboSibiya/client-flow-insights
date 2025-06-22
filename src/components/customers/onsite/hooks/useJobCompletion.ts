
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Customer } from '../types';
import { CustomerStatus } from '@/types/customer';

export const useJobCompletion = () => {
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
        throw new Error('User not authenticated');
      }

      console.log('Submitting job completion for customer:', selectedCustomer.id);

      // Try to get employee ID, but don't fail if it doesn't exist
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
        console.log('No employee record found, proceeding without employee ID');
      }

      // Update customer status
      const { error: updateError } = await supabase
        .from('customers')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedCustomer.id);

      if (updateError) throw updateError;
      console.log('Customer status updated successfully');

      // Record job completion
      const jobCompletionData = {
        customer_id: selectedCustomer.id,
        employee_id: employeeId,
        notes: notes.trim() || null,
        before_status: selectedCustomer.status,
        after_status: newStatus,
        location_lat: location?.lat || null,
        location_lng: location?.lng || null
      };

      console.log('Inserting job completion:', jobCompletionData);

      const { error: jobError } = await supabase
        .from('job_completions')
        .insert(jobCompletionData);

      if (jobError) throw jobError;

      toast({
        title: "Success",
        description: `Job completed! Customer status updated to ${newStatus}`,
      });

      return true;
    } catch (error: any) {
      console.error('Error updating status:', error);
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
