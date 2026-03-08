import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  X, Mail, Phone, MapPin, Calendar, Clock, Send,
  FileText, MessageSquare, Activity, Edit2, Trash2,
  User, Ticket, ExternalLink
} from "lucide-react";
import { format, formatDistanceToNow } from 'date-fns';
import { Customer, CustomerTicket } from '@/types/customer';
import { PipelineType } from '@/hooks/usePipeline';

interface PipelineDetailPanelProps {
  item: Customer | CustomerTicket;
  type: PipelineType;
  onClose: () => void;
  onEdit?: (item: Customer | CustomerTicket) => void;
  onDelete?: (item: Customer | CustomerTicket) => void;
}

const PipelineDetailPanel = ({
  item,
  type,
  onClose,
  onEdit,
  onDelete,
}: PipelineDetailPanelProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');

  if (type === 'customer') {
    const customer = item as Customer;
    
    return (
      <Card className="h-full flex flex-col border-l-0 rounded-l-none">
        <CardHeader className="pb-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {(customer?.name || 'Unknown').split(' ').map(n => n[0] || '').join('').toUpperCase().slice(0, 2) || '??'}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{customer?.name || 'Unknown'}</CardTitle>
                <p className="text-sm text-muted-foreground">{customer?.email || 'No email'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => onEdit?.(customer)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2 mt-4">
            <Button size="sm" className="gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <Phone className="h-4 w-4" />
              Call
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <Ticket className="h-4 w-4" />
              New Ticket
            </Button>
          </div>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
            <TabsTrigger 
              value="overview" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="notes"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Notes
            </TabsTrigger>
            <TabsTrigger 
              value="activity"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Activity
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="overview" className="m-0 p-4 space-y-4">
              {/* Contact info */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.email}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status & dates */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant="outline" className="mt-1 capitalize">
                      {customer.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tickets</p>
                    <p className="font-medium">{customer.ticketCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm">{customer?.createdAt ? format(new Date(customer.createdAt), 'MMM d, yyyy') : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Updated</p>
                    <p className="text-sm">{customer?.updatedAt ? formatDistanceToNow(new Date(customer.updatedAt), { addSuffix: true }) : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Notes preview */}
              {customer.notes && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                  <p className="text-sm bg-muted/50 p-3 rounded-lg">{customer.notes}</p>
                </div>
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
                <Button size="sm" className="gap-2">
                  <Send className="h-4 w-4" />
                  Add Note
                </Button>
              </div>

              <div className="space-y-3 pt-4 border-t">
                {/* Sample notes */}
                <div className="bg-muted/30 p-3 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">System</span>
                    <span className="text-xs text-muted-foreground">2 days ago</span>
                  </div>
                  <p className="text-sm">Customer moved to Qualified stage</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="m-0 p-4">
              <div className="space-y-4">
                {/* Activity timeline */}
                <div className="relative pl-6 border-l-2 border-muted space-y-6">
                  <div className="relative">
                    <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-primary" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Status changed to {customer?.status || 'unknown'}</p>
                      <p className="text-xs text-muted-foreground">
                        {customer?.updatedAt ? formatDistanceToNow(new Date(customer.updatedAt), { addSuffix: true }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-muted" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Customer created</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(customer.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </Card>
    );
  }

  // Ticket detail
  const ticket = item as CustomerTicket;
  
  return (
    <Card className="h-full flex flex-col border-l-0 rounded-l-none">
      <CardHeader className="pb-4 border-b">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs">
                #{ticket.ticketNumber}
              </Badge>
              <Badge className={`text-xs ${
                ticket.priority === 'urgent' ? 'bg-destructive' :
                ticket.priority === 'high' ? 'bg-destructive/80' :
                ticket.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
              } text-white`}>
                {ticket.priority}
              </Badge>
            </div>
            <CardTitle className="text-lg">{ticket.subject}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit?.(ticket)}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2 mt-4">
          <Button size="sm" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Reply
          </Button>
          <Button size="sm" variant="outline" className="gap-2">
            <User className="h-4 w-4" />
            Assign
          </Button>
        </div>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
          <TabsTrigger 
            value="overview" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="messages"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Messages
          </TabsTrigger>
          <TabsTrigger 
            value="time"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Time Tracking
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="overview" className="m-0 p-4 space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="outline" className="mt-1 capitalize">
                    {ticket.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Assigned To</p>
                  <p className="font-medium">{ticket.assignedTo?.name || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Time Spent</p>
                  <p className="font-medium">{Math.round(ticket.totalTimeSpent / 60)}h {ticket.totalTimeSpent % 60}m</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm">{format(new Date(ticket.createdAt), 'MMM d, yyyy')}</p>
                </div>
              </div>
            </div>

            {ticket.description && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                <p className="text-sm bg-muted/50 p-3 rounded-lg">{ticket.description}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages" className="m-0 p-4 space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Write a reply..."
                className="min-h-[100px]"
              />
              <Button size="sm" className="gap-2">
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
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{Math.round(ticket.totalTimeSpent / 60)}h {ticket.totalTimeSpent % 60}m</p>
                <p className="text-sm text-muted-foreground">Total time logged</p>
              </div>
              <Button size="sm" variant="outline" className="gap-2">
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
      </Tabs>
    </Card>
  );
};

export default PipelineDetailPanel;
