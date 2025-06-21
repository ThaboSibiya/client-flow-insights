
import { useCallback } from 'react';
import { leadNurturingService } from '@/services/leadNurturingService';
import { Customer, CustomerStatus } from '@/types/customer';
import { toast } from '@/hooks/use-toast';

export const useLeadNurturing = () => {
  const autoAssignLead = useCallback(async (customer: Customer) => {
    try {
      const assignedTo = await leadNurturingService.autoAssignLead(customer);
      
      if (assignedTo) {
        toast({
          title: "Lead Assigned",
          description: `${customer.name} has been automatically assigned to a sales representative.`,
        });
        return assignedTo;
      } else {
        toast({
          title: "Assignment Failed", 
          description: "No available sales representatives found for assignment.",
          variant: "destructive"
        });
        return null;
      }
    } catch (error) {
      console.error('Error in auto-assign lead:', error);
      toast({
        title: "Error",
        description: "Failed to auto-assign lead. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  }, []);

  const setupFollowUpReminders = useCallback(async (customerId: string) => {
    try {
      await leadNurturingService.setupFollowUpReminders(customerId);
      toast({
        title: "Follow-up Scheduled",
        description: "Automatic follow-up reminders have been set up.",
      });
    } catch (error) {
      console.error('Error setting up follow-up reminders:', error);
      toast({
        title: "Error",
        description: "Failed to schedule follow-up reminders.",
        variant: "destructive"
      });
    }
  }, []);

  const handleStatusProgression = useCallback(async (
    customerId: string, 
    oldStatus: CustomerStatus, 
    newStatus: CustomerStatus
  ) => {
    try {
      await leadNurturingService.handleStatusProgression(customerId, oldStatus, newStatus);
      toast({
        title: "Status Updated",
        description: `Customer status changed to ${newStatus}. Next steps have been scheduled.`,
      });
    } catch (error) {
      console.error('Error handling status progression:', error);
      toast({
        title: "Error",
        description: "Failed to process status change automation.",
        variant: "destructive"
      });
    }
  }, []);

  const createNextStepTasks = useCallback(async (customer: Customer) => {
    try {
      await leadNurturingService.createNextStepTasks(customer);
      toast({
        title: "Tasks Created",
        description: `Next step tasks have been created for ${customer.name}.`,
      });
    } catch (error) {
      console.error('Error creating next step tasks:', error);
      toast({
        title: "Error",
        description: "Failed to create next step tasks.",
        variant: "destructive"
      });
    }
  }, []);

  return {
    autoAssignLead,
    setupFollowUpReminders,
    handleStatusProgression,
    createNextStepTasks
  };
};
