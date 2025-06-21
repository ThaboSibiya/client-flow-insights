
import { supabase } from '@/integrations/supabase/client';
import { Customer, CustomerStatus } from '@/types/customer';
import { automationPerformanceService } from './automationPerformanceService';

interface WelcomeEmailTemplate {
  id: string;
  subject: string;
  body: string;
  delay: number; // in hours
  order: number;
}

interface SMSNotification {
  recipient: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface WhatsAppMessage {
  recipient: string;
  template: string;
  parameters: Record<string, string>;
}

interface FollowUpCall {
  customerId: string;
  scheduledAt: Date;
  type: 'welcome' | 'check_in' | 'closing' | 'feedback';
  priority: 'low' | 'medium' | 'high';
}

export class CommunicationAutomationService {
  // Welcome Email Sequence
  async triggerWelcomeSequence(customer: Customer): Promise<void> {
    try {
      const welcomeSequence = this.getWelcomeEmailSequence(customer.status);
      
      for (const email of welcomeSequence) {
        const scheduledAt = new Date(Date.now() + email.delay * 60 * 60 * 1000);
        
        automationPerformanceService.addJob({
          automationId: `welcome_email_${customer.id}_${email.id}`,
          type: 'action',
          data: {
            action: {
              type: 'send_email',
              recipient: customer.email,
              subject: this.personalizeTemplate(email.subject, customer),
              body: this.personalizeTemplate(email.body, customer),
              template: 'welcome_sequence'
            },
            customer
          },
          priority: 'medium',
          scheduledAt,
          maxRetries: 3
        });
      }

      console.log(`Welcome email sequence triggered for ${customer.name}`);
    } catch (error) {
      console.error('Error triggering welcome sequence:', error);
    }
  }

  // SMS Notifications for Urgent Status Changes
  async sendUrgentStatusSMS(customer: Customer, oldStatus: CustomerStatus, newStatus: CustomerStatus): Promise<void> {
    try {
      const urgentStatuses = ['pending', 'finalised'];
      
      if (urgentStatuses.includes(newStatus) && customer.phone) {
        const message = this.generateStatusSMSMessage(customer, oldStatus, newStatus);
        
        const smsNotification: SMSNotification = {
          recipient: customer.phone,
          message,
          priority: 'urgent'
        };

        automationPerformanceService.addToBatch('sms', smsNotification);
        
        // Also send to assigned employee if available
        if (customer.assigned_to) {
          await this.notifyAssignedEmployee(customer, newStatus);
        }

        console.log(`Urgent SMS sent for status change: ${customer.name} (${oldStatus} → ${newStatus})`);
      }
    } catch (error) {
      console.error('Error sending urgent status SMS:', error);
    }
  }

  // WhatsApp Integration for Job Completion
  async sendJobCompletionWhatsApp(customer: Customer, jobDetails: any): Promise<void> {
    try {
      if (!customer.phone) return;

      const whatsappMessage: WhatsAppMessage = {
        recipient: customer.phone,
        template: 'job_completion_notification',
        parameters: {
          customer_name: customer.name,
          job_type: jobDetails.type || 'service',
          completion_date: new Date().toLocaleDateString(),
          next_steps: jobDetails.nextSteps || 'We will follow up within 2 business days',
          support_number: '+1-555-SUPPORT'
        }
      };

      automationPerformanceService.addToBatch('whatsapp', whatsappMessage);

      // Schedule follow-up call
      await this.scheduleFollowUpCall(customer, 'feedback', 24); // 24 hours after job completion

      console.log(`WhatsApp job completion message sent to ${customer.name}`);
    } catch (error) {
      console.error('Error sending WhatsApp job completion:', error);
    }
  }

  // Auto-scheduling Follow-up Calls
  async scheduleFollowUpCall(customer: Customer, callType: FollowUpCall['type'], hoursFromNow: number): Promise<void> {
    try {
      const scheduledAt = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
      
      const followUpCall: FollowUpCall = {
        customerId: customer.id,
        scheduledAt,
        type: callType,
        priority: this.getCallPriority(callType, customer.status)
      };

      // Add to automation queue
      automationPerformanceService.addJob({
        automationId: `follow_up_call_${customer.id}_${Date.now()}`,
        type: 'trigger',
        data: {
          customer,
          callDetails: followUpCall,
          action: 'schedule_call'
        },
        priority: followUpCall.priority,
        scheduledAt,
        maxRetries: 2
      });

      // Store in database for tracking
      await this.storeScheduledCall(followUpCall);

      console.log(`Follow-up call scheduled for ${customer.name} at ${scheduledAt.toISOString()}`);
    } catch (error) {
      console.error('Error scheduling follow-up call:', error);
    }
  }

  // Customer Preference-based Communication
  async sendPreferenceBasedCommunication(customer: Customer, messageType: string, content: string): Promise<void> {
    try {
      const preferences = await this.getCustomerCommunicationPreferences(customer.id);
      
      // Send via preferred channel
      switch (preferences.preferredChannel) {
        case 'email':
          automationPerformanceService.addToBatch('email', {
            to: customer.email,
            subject: `Update regarding your ${messageType}`,
            body: content,
            template: 'preference_based'
          });
          break;
        case 'sms':
          if (customer.phone) {
            automationPerformanceService.addToBatch('sms', {
              recipient: customer.phone,
              message: content.substring(0, 160), // SMS character limit
              priority: 'medium'
            });
          }
          break;
        case 'whatsapp':
          if (customer.phone) {
            automationPerformanceService.addToBatch('whatsapp', {
              recipient: customer.phone,
              template: 'general_update',
              parameters: { message: content, customer_name: customer.name }
            });
          }
          break;
      }

      console.log(`Preference-based communication sent to ${customer.name} via ${preferences.preferredChannel}`);
    } catch (error) {
      console.error('Error sending preference-based communication:', error);
    }
  }

  // Private helper methods
  private getWelcomeEmailSequence(customerStatus: CustomerStatus): WelcomeEmailTemplate[] {
    const baseSequence = [
      {
        id: 'welcome_1',
        subject: 'Welcome to {company_name}, {customer_name}!',
        body: `Dear {customer_name},\n\nWelcome to our service! We're excited to work with you.\n\nWhat happens next:\n- Your dedicated representative will contact you within 24 hours\n- We'll schedule an initial consultation\n- You'll receive regular updates on your project status\n\nBest regards,\nThe Team`,
        delay: 0, // Immediate
        order: 1
      },
      {
        id: 'welcome_2',
        subject: 'Getting Started Guide - {customer_name}',
        body: `Hi {customer_name},\n\nHere's your personalized getting started guide:\n\n1. Complete your profile\n2. Review our service offerings\n3. Schedule your first consultation\n\nNeed help? Reply to this email or call us anytime.\n\nBest regards,\nCustomer Success Team`,
        delay: 24, // 24 hours later
        order: 2
      }
    ];

    // Add status-specific emails
    if (customerStatus === 'new') {
      baseSequence.push({
        id: 'welcome_3_new',
        subject: 'Your Next Steps - {customer_name}',
        body: `Hello {customer_name},\n\nAs a new customer, we want to ensure you have everything you need.\n\nYour account manager will reach out to discuss:\n- Your specific requirements\n- Timeline expectations\n- Available service options\n\nLooking forward to serving you!\n\nBest regards,\nAccount Management Team`,
        delay: 72, // 3 days later
        order: 3
      });
    }

    return baseSequence;
  }

  private generateStatusSMSMessage(customer: Customer, oldStatus: CustomerStatus, newStatus: CustomerStatus): string {
    const statusMessages = {
      pending: `Hi ${customer.name}, your service status has been updated to PENDING. We're processing your request and will update you soon. Reply STOP to opt out.`,
      finalised: `Great news ${customer.name}! Your service has been COMPLETED. Thank you for choosing us! A satisfaction survey will follow. Reply STOP to opt out.`,
      existing: `Hi ${customer.name}, your account status has been updated. Your representative will contact you with next steps. Reply STOP to opt out.`
    };

    return statusMessages[newStatus] || `Hi ${customer.name}, your status has been updated from ${oldStatus} to ${newStatus}. Reply STOP to opt out.`;
  }

  private personalizeTemplate(template: string, customer: Customer): string {
    return template
      .replace(/{customer_name}/g, customer.name)
      .replace(/{customer_email}/g, customer.email)
      .replace(/{company_name}/g, 'Your Company') // This could be fetched from settings
      .replace(/{customer_phone}/g, customer.phone || 'Not provided');
  }

  private getCallPriority(callType: FollowUpCall['type'], customerStatus: CustomerStatus): 'low' | 'medium' | 'high' {
    if (callType === 'feedback' && customerStatus === 'finalised') return 'high';
    if (callType === 'welcome' && customerStatus === 'new') return 'high';
    if (callType === 'check_in' && customerStatus === 'pending') return 'medium';
    return 'low';
  }

  private async notifyAssignedEmployee(customer: Customer, newStatus: CustomerStatus): Promise<void> {
    if (!customer.assigned_to) return;

    try {
      const { data: employee } = await supabase
        .from('employees')
        .select('first_name, last_name, phone')
        .eq('id', customer.assigned_to)
        .single();

      if (employee?.phone) {
        automationPerformanceService.addToBatch('sms', {
          recipient: employee.phone,
          message: `Alert: Customer ${customer.name} status changed to ${newStatus.toUpperCase()}. Please take action.`,
          priority: 'high'
        });
      }
    } catch (error) {
      console.error('Error notifying assigned employee:', error);
    }
  }

  private async getCustomerCommunicationPreferences(customerId: string): Promise<{
    preferredChannel: 'email' | 'sms' | 'whatsapp';
    allowMarketing: boolean;
    frequency: 'immediate' | 'daily' | 'weekly';
  }> {
    // Default preferences - in a real app this would be stored in the database
    return {
      preferredChannel: 'email',
      allowMarketing: true,
      frequency: 'immediate'
    };
  }

  private async storeScheduledCall(followUpCall: FollowUpCall): Promise<void> {
    try {
      const { error } = await supabase
        .from('scheduled_calls')
        .insert({
          customer_id: followUpCall.customerId,
          scheduled_at: followUpCall.scheduledAt.toISOString(),
          call_type: followUpCall.type,
          priority: followUpCall.priority,
          status: 'scheduled'
        });

      if (error) {
        console.error('Error storing scheduled call:', error);
      }
    } catch (error) {
      console.error('Error in storeScheduledCall:', error);
    }
  }
}

export const communicationAutomationService = new CommunicationAutomationService();
