
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Mail, Send, X } from 'lucide-react';
import { sendEmail } from '@/services/emailService';
import { useAuth } from '@/context/AuthContext';

interface EmailCustomerFormProps {
  customerEmail: string;
  customerName: string;
  onClose: () => void;
}

interface EmailFormValues {
  subject: string;
  message: string;
}

const EmailCustomerForm = ({ customerEmail, customerName, onClose }: EmailCustomerFormProps) => {
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();
  
  const form = useForm<EmailFormValues>({
    defaultValues: {
      subject: '',
      message: ''
    }
  });

  const onSubmit = async (values: EmailFormValues) => {
    setIsSending(true);
    
    try {
      await sendEmail({
        to: customerEmail,
        subject: values.subject,
        message: values.message,
        senderName: user?.email || 'Broker CRM',
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to send email:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="mb-4">
          <h3 className="text-lg font-medium">Send Email to {customerName}</h3>
          <p className="text-sm text-muted-foreground">{customerEmail}</p>
        </div>
        
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input placeholder="Email subject" {...field} required />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Type your message here..." 
                  className="min-h-[150px]"
                  {...field} 
                  required 
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSending}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          
          <Button 
            type="submit"
            disabled={isSending}
            className="bg-gradient-to-r from-broker-primary to-broker-accent hover:shadow-md transition-all"
          >
            {isSending ? (
              <>Processing...</>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EmailCustomerForm;
