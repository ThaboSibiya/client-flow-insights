
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { CustomerTicket } from '@/types/customer';
import TicketFormFields from './TicketFormFields';

interface NewTicketFormProps {
  onSubmit: (data: Omit<CustomerTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

type FormData = {
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  assignedTo?: string;
};

const NewTicketForm = ({ onSubmit, onCancel }: NewTicketFormProps) => {
  const form = useForm<FormData>({
    defaultValues: {
      subject: '',
      description: '',
      priority: 'medium',
      status: 'open',
      assignedTo: undefined,
    },
  });

  const handleSubmit = (data: FormData) => {
    onSubmit({
      ...data,
      assignedTo: undefined,
      timeEntries: [],
      totalTimeSpent: 0,
    });
    form.reset();
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <TicketFormFields control={form.control} />
          
          <div className="flex gap-2">
            <Button type="submit" size="sm">Create Ticket</Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewTicketForm;
