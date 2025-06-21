
import { useCallback } from 'react';
import { communicationAutomationService } from '@/services/communicationAutomationService';
import { Customer, CustomerStatus } from '@/types/customer';
import { toast } from '@/hooks/use-toast';

export const useCommunicationAutomation = () => {
  const triggerWelcomeSequence = useCallback(async (customer: Customer) => {
    try {
      await communicationAutomationService.triggerWelcomeSequence(customer);
      toast({
        title: "Welcome Sequence Started",
        description: `Welcome email sequence has been triggered for ${customer.name}.`,
      });
    } catch (error) {
      console.error('Error triggering welcome sequence:', error);
      toast({
        title: "Error",
        description: "Failed to start welcome sequence.",
        variant: "destructive"
      });
    }
  }, []);

  const sendUrgentStatusSMS = useCallback(async (
    customer: Customer, 
    oldStatus: CustomerStatus, 
    newStatus: CustomerStatus
  ) => {
    try {
      await communicationAutomationService.sendUrgentStatusSMS(customer, oldStatus, newStatus);
      if (customer.phone) {
        toast({
          title: "SMS Notification Sent",
          description: `Urgent status change SMS sent to ${customer.name}.`,
        });
      }
    } catch (error) {
      console.error('Error sending urgent SMS:', error);
      toast({
        title: "Error",
        description: "Failed to send SMS notification.",
        variant: "destructive"
      });
    }
  }, []);

  const sendJobCompletionWhatsApp = useCallback(async (customer: Customer, jobDetails: any) => {
    try {
      await communicationAutomationService.sendJobCompletionWhatsApp(customer, jobDetails);
      toast({
        title: "WhatsApp Message Sent",
        description: `Job completion notification sent to ${customer.name} via WhatsApp.`,
      });
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      toast({
        title: "Error",
        description: "Failed to send WhatsApp notification.",
        variant: "destructive"
      });
    }
  }, []);

  const scheduleFollowUpCall = useCallback(async (
    customer: Customer, 
    callType: 'welcome' | 'check_in' | 'closing' | 'feedback', 
    hoursFromNow: number
  ) => {
    try {
      await communicationAutomationService.scheduleFollowUpCall(customer, callType, hoursFromNow);
      toast({
        title: "Follow-up Call Scheduled",
        description: `${callType} call scheduled for ${customer.name} in ${hoursFromNow} hours.`,
      });
    } catch (error) {
      console.error('Error scheduling follow-up call:', error);
      toast({
        title: "Error",
        description: "Failed to schedule follow-up call.",
        variant: "destructive"
      });
    }
  }, []);

  const sendPreferenceBasedCommunication = useCallback(async (
    customer: Customer,
    messageType: string,
    content: string
  ) => {
    try {
      await communicationAutomationService.sendPreferenceBasedCommunication(customer, messageType, content);
      toast({
        title: "Message Sent",
        description: `${messageType} message sent to ${customer.name} via their preferred channel.`,
      });
    } catch (error) {
      console.error('Error sending preference-based communication:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive"
      });
    }
  }, []);

  return {
    triggerWelcomeSequence,
    sendUrgentStatusSMS,
    sendJobCompletionWhatsApp,
    scheduleFollowUpCall,
    sendPreferenceBasedCommunication
  };
};
