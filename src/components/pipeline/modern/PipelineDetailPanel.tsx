import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X, Mail, Phone, MapPin, Clock, Send,
  MessageSquare, Edit2, User, Ticket,
} from "lucide-react";
import { format, formatDistanceToNow } from 'date-fns';
import { Customer, CustomerTicket } from '@/types/customer';
import { PipelineType } from '@/hooks/usePipeline';
import { toast } from '@/hooks/use-toast';
import AssignTicketDialog from '@/components/tickets/AssignTicketDialog';

interface PipelineDetailPanelProps {
  item: Customer | CustomerTicket;
  type: PipelineType;
  onClose: () => void;
  onEdit?: (item: Customer | CustomerTicket) => void;
  onDelete?: (item: Customer | CustomerTicket) => void;
}

const tabTriggerClass =
  "rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground";

const PipelineDetailPanel = ({
  item,
  type,
  onClose,
  onEdit,
}: PipelineDetailPanelProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');
  const [assignOpen, setAssignOpen] = useState(false);

  const handleNotImplemented = (label: string) =>
    toast({ title: `${label}`, description: 'Coming soon.' });

  if (type === 'customer') {
    const customer = item as Customer;
    const initials =
      (customer?.name || 'Unknown')
        .split(' ')
        .map((n) => n[0] || '')
        .join('')
        .toUpperCase()
        .slice(0, 2) || '??';

    return (
      <Card className="h-full min-h-0 flex flex-col border-l-0 rounded-l-none overflow-hidden">
        <CardHeader className="pb-4 border-b shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg truncate">{customer?.name || 'Unknown'}</CardTitle>
                <p className="text-sm text-muted-foreground truncate">
                  {customer?.email || 'No email'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" onClick={() => onEdit?.(customer)} aria-label="Edit">
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Button
              size="sm"
              className="gap-2"
              onClick={() => {
                if (!customer?.email) {
                  toast({
                    title: 'No email on file',
                    description: 'Add an email to this customer first.',
                    variant: 'destructive',
                  });
                  return;
                }
                onClose();
                navigate(
                  `/customers/${customer.id}?tab=conversations&action=new&channel=email`
                );
              }}
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => {
                if (!customer?.phone) {
                  toast({
                    title: 'No phone on file',
                    description: 'Add a phone number to this customer first.',
                    variant: 'destructive',
                  });
                  return;
                }
                onClose();
                navigate(
                  `/customers/${customer.id}?tab=conversations&action=new&channel=voice`
                );
              }}
            >
              <Phone className="h-4 w-4" />
              Call
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => {
                onClose();
                navigate(`/customers/${customer.id}?tab=tickets&action=new`);
              }}
            >
              <Ticket className="h-4 w-4" />
              New Ticket
            </Button>
          </div>


        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0 flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0 shrink-0">
            <TabsTrigger value="overview" className={tabTriggerClass}>Overview</TabsTrigger>
            <TabsTrigger value="notes" className={tabTriggerClass}>Notes</TabsTrigger>
            <TabsTrigger value="activity" className={tabTriggerClass}>Activity</TabsTrigger>
          </TabsList>

          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              <TabsContent value="overview" className="m-0 p-4 space-y-5">
                <section className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 text-sm min-w-0">
                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <span className="break-all">{customer.email || '—'}</span>
                    </div>
                    {customer.phone && (
                      <div className="flex items-start gap-3 text-sm min-w-0">
                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="break-all">{customer.phone}</span>
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-start gap-3 text-sm min-w-0">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="break-words">{customer.address}</span>
                      </div>
                    )}
                  </div>
                </section>

                <section className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge variant="outline" className="mt-1 capitalize">{customer.status}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Tickets</p>
                      <p className="font-medium">{customer.ticketCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="text-sm">
                        {customer?.createdAt ? format(new Date(customer.createdAt), 'MMM d, yyyy') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last Updated</p>
                      <p className="text-sm">
                        {customer?.updatedAt ? formatDistanceToNow(new Date(customer.updatedAt), { addSuffix: true }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </section>

                {customer.notes && (
                  <section className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                    <p className="text-sm bg-muted/50 p-3 rounded-lg whitespace-pre-wrap break-words">
                      {customer.notes}
                    </p>
                  </section>
                )}
              </TabsContent>

              <TabsContent value="notes" className="m-0 p-4 space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <Button
                    size="sm"
                    className="gap-2"
                    disabled={!newNote.trim()}
                    onClick={() => {
                      handleNotImplemented('Note saved locally');
                      setNewNote('');
                    }}
                  >
                    <Send className="h-4 w-4" />
                    Add Note
                  </Button>
                </div>

                {customer.notes ? (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="bg-muted/30 p-3 rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">Customer note</span>
                        <span className="text-xs text-muted-foreground">
                          {customer?.updatedAt ? formatDistanceToNow(new Date(customer.updatedAt), { addSuffix: true }) : ''}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap break-words">{customer.notes}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8 border-t">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notes yet</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="m-0 p-4">
                <div className="relative pl-6 border-l-2 border-muted space-y-6">
                  <div className="relative">
                    <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-primary" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Status: <span className="capitalize">{customer?.status || 'unknown'}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {customer?.updatedAt ? formatDistanceToNow(new Date(customer.updatedAt), { addSuffix: true }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-muted" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Customer created</p>
                      <p className="text-xs text-muted-foreground">
                        {customer?.createdAt ? format(new Date(customer.createdAt), 'MMM d, yyyy') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </ScrollArea>
          </div>
        </Tabs>
      </Card>
    );
  }

  // Ticket detail
  const ticket = item as CustomerTicket;

  return (
    <Card className="h-full min-h-0 flex flex-col border-l-0 rounded-l-none overflow-hidden">
      <CardHeader className="pb-4 border-b shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="outline" className="text-xs">#{ticket.ticketNumber}</Badge>
              <Badge className={`text-xs ${
                ticket.priority === 'urgent' ? 'bg-destructive' :
                ticket.priority === 'high' ? 'bg-destructive/80' :
                ticket.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
              } text-white`}>
                {ticket.priority}
              </Badge>
            </div>
            <CardTitle className="text-lg break-words">{ticket.subject}</CardTitle>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" onClick={() => onEdit?.(ticket)} aria-label="Edit">
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          <Button size="sm" className="gap-2" onClick={() => setActiveTab('messages')}>
            <MessageSquare className="h-4 w-4" />
            Reply
          </Button>
          <Button size="sm" variant="outline" className="gap-2" onClick={() => setAssignOpen(true)}>
            <User className="h-4 w-4" />
            {ticket.assignedTo?.name ? 'Reassign' : 'Assign'}
          </Button>
        </div>
        <AssignTicketDialog
          ticket={ticket}
          customerId={(ticket as any).customerId || (ticket as any).customer_id}
          isOpen={assignOpen}
          onClose={() => setAssignOpen(false)}
        />
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0 shrink-0">
          <TabsTrigger value="overview" className={tabTriggerClass}>Overview</TabsTrigger>
          <TabsTrigger value="messages" className={tabTriggerClass}>Messages</TabsTrigger>
          <TabsTrigger value="time" className={tabTriggerClass}>Time Tracking</TabsTrigger>
        </TabsList>

        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <TabsContent value="overview" className="m-0 p-4 space-y-5">
              <section className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant="outline" className="mt-1 capitalize">{ticket.status}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Assigned To</p>
                    <p className="font-medium truncate">{ticket.assignedTo?.name || 'Unassigned'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Time Spent</p>
                    <p className="font-medium">
                      {Math.round((ticket?.totalTimeSpent || 0) / 60)}h {(ticket?.totalTimeSpent || 0) % 60}m
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm">
                      {ticket?.createdAt ? format(new Date(ticket.createdAt), 'MMM d, yyyy') : 'N/A'}
                    </p>
                  </div>
                </div>
              </section>

              {ticket.description && (
                <section className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg whitespace-pre-wrap break-words">
                    {ticket.description}
                  </p>
                </section>
              )}
            </TabsContent>

            <TabsContent value="messages" className="m-0 p-4 space-y-4">
              <div className="space-y-2">
                <Textarea placeholder="Write a reply..." className="min-h-[100px]" />
                <Button size="sm" className="gap-2" onClick={() => handleNotImplemented('Reply sent')}>
                  <Send className="h-4 w-4" />
                  Send Reply
                </Button>
              </div>

              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages yet</p>
              </div>
            </TabsContent>

            <TabsContent value="time" className="m-0 p-4 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-2xl font-bold">
                    {Math.round((ticket?.totalTimeSpent || 0) / 60)}h {(ticket?.totalTimeSpent || 0) % 60}m
                  </p>
                  <p className="text-sm text-muted-foreground">Total time logged</p>
                </div>
                <Button size="sm" variant="outline" className="gap-2" onClick={() => handleNotImplemented('Log time')}>
                  <Clock className="h-4 w-4" />
                  Log Time
                </Button>
              </div>

              {(ticket.timeEntries?.length ?? 0) === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No time entries</p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </div>
      </Tabs>
    </Card>
  );
};

export default PipelineDetailPanel;
