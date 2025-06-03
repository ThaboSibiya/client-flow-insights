
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Plus, X, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Customer, CustomerTicket, TicketStatus } from '@/types/customer';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface TicketManagementDialogProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateTicket: (customerId: string, ticket: Omit<CustomerTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTicketStatus: (ticketId: string, status: TicketStatus) => void;
}

const TicketManagementDialog = ({ 
  customer, 
  isOpen, 
  onClose, 
  onCreateTicket, 
  onUpdateTicketStatus 
}: TicketManagementDialogProps) => {
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  
  const form = useForm({
    defaultValues: {
      subject: '',
      priority: 'medium' as const,
      status: 'open' as const,
    },
  });

  const onSubmit = (data: any) => {
    if (customer) {
      onCreateTicket(customer.id, data);
      form.reset();
      setShowNewTicketForm(false);
    }
  };

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} modal={true}>
      <DialogContent className="sm:max-w-[800px] bg-white border-0 shadow-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="bg-gradient-to-r from-broker-primary/10 to-broker-accent/10 p-4 -m-6 mb-4 rounded-t-lg">
          <DialogTitle className="text-xl font-semibold text-broker-primary flex items-center gap-2">
            Ticket Management - {customer?.name}
            <Badge variant="outline">{customer?.ticketCount || 0} Total Tickets</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Active Tickets</h3>
            <Button 
              onClick={() => setShowNewTicketForm(!showNewTicketForm)}
              className="bg-gradient-to-r from-broker-primary to-broker-accent"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Ticket
            </Button>
          </div>

          {showNewTicketForm && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief description of the issue" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">Create Ticket</Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowNewTicketForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          <div className="space-y-3">
            {customer?.activeTickets?.map((ticket) => (
              <div key={ticket.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(ticket.status)}
                      <span className="font-medium">{ticket.ticketNumber}</span>
                      <Badge 
                        className={`text-white text-xs ${getPriorityColor(ticket.priority)}`}
                      >
                        {ticket.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{ticket.subject}</p>
                    <p className="text-xs text-gray-500">
                      Created {formatDistanceToNow(ticket.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select 
                      value={ticket.status} 
                      onValueChange={(status: TicketStatus) => onUpdateTicketStatus(ticket.id, status)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
            
            {(!customer?.activeTickets || customer.activeTickets.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                No tickets found for this customer
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketManagementDialog;
