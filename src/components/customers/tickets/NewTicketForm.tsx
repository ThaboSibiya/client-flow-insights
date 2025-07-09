
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { CustomerTicket } from '@/types/customer';
import { useTicketData } from '@/hooks/useTicketData';
import TemplateSelector from './TemplateSelector';
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
  const { templates, teamMembers } = useTicketData();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const form = useForm<FormData>({
    defaultValues: {
      subject: '',
      description: '',
      priority: 'medium',
      status: 'open',
      assignedTo: undefined,
    },
  });

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      form.setValue('subject', template.name);
      form.setValue('description', template.description);
      form.setValue('priority', template.defaultPriority);
    }
  };

  const handleSubmit = (data: FormData) => {
    const assignedMember = data.assignedTo ? 
      teamMembers.find(member => member.id === data.assignedTo) : undefined;
    
    onSubmit({
      ...data,
      customerId: 'temp-customer-id', // This will be replaced by the actual customer ID
      assignedTo: assignedMember,
      timeEntries: [],
      totalTimeSpent: 0,
    });
    form.reset();
    setSelectedTemplate('');
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <TemplateSelector
        templates={templates}
        selectedTemplate={selectedTemplate}
        onTemplateSelect={handleTemplateSelect}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <TicketFormFields
            control={form.control}
            teamMembers={teamMembers}
          />
          
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
