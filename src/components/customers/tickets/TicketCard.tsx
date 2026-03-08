import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CustomerTicket, TicketStatus } from '@/types/customer';
import { User, Clock, AlertCircle, Timer, ChevronDown, ChevronUp, ArrowUp, Paperclip, MessageSquare } from 'lucide-react';
import TimeTracker from './TimeTracker';
import TicketAttachments from './TicketAttachments';
import TicketComments from './TicketComments';
import SLAStatus from '../../tickets/SLAStatus';
import { sendTicketNotification } from '@/services/ticketNotificationService';
import { useTicketRouting } from '@/hooks/useTicketRouting';
import { getPriorityColor, getStatusColor, formatTicketDate, formatDuration } from '@/utils/ticketFormatters';
import SatisfactionRating from './SatisfactionRating';

interface TicketCardProps {
  ticket: CustomerTicket;
  onStatusUpdate: (ticketId: string, status: TicketStatus) => void;
  onAddTimeEntry?: (ticketId: string, timeEntry: any) => void;
  customerEmail?: string;
  customerName?: string;
  customerId?: string;
}

const TicketCard = ({ ticket, onStatusUpdate, onAddTimeEntry, customerEmail, customerName, customerId }: TicketCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSatisfactionRating, setShowSatisfactionRating] = useState(false);
  const { escalateTicket, isProcessing } = useTicketRouting();

  const handleStatusUpdate = async (newStatus: TicketStatus) => {
    const oldStatus = ticket.status;
    onStatusUpdate(ticket.id, newStatus);

    if (customerEmail && customerName && oldStatus !== newStatus) {
      await sendTicketNotification({
        ticketId: ticket.id,
        customerEmail,
        customerName,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        type: 'status_changed',
        details: { oldStatus, newStatus },
      });
    }

    if ((newStatus === 'resolved' || newStatus === 'closed') && customerId && oldStatus !== newStatus) {
      setShowSatisfactionRating(true);
    }
  };

  const handleEscalateTicket = async () => {
    try {
      await escalateTicket(ticket.id, 'Manual escalation requested');
    } catch (error) {
      console.error('Failed to escalate ticket:', error);
    }
  };

  const handleAddTimeEntry = (timeEntry: any) => {
    if (onAddTimeEntry) {
      onAddTimeEntry(ticket.id, timeEntry);
    }
  };

  return (
    <>
      <div className="border border-border rounded-lg p-4 bg-card hover:shadow-md transition-shadow">
        {/* Header row */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-xs font-mono text-muted-foreground">{ticket.ticketNumber}</span>
              <Badge className={getPriorityColor(ticket.priority)} variant="outline">
                {ticket.priority === 'urgent' && <AlertCircle className="h-3 w-3 mr-1" />}
                {ticket.priority}
              </Badge>
              <SLAStatus ticket={ticket} compact={true} />
              {ticket.totalTimeSpent > 0 && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  <Timer className="h-3 w-3 mr-1" />
                  {formatDuration(ticket.totalTimeSpent)}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-foreground text-sm leading-snug">{ticket.subject}</h3>
            {ticket.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ticket.description}</p>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Select value={ticket.status} onValueChange={handleStatusUpdate}>
              <SelectTrigger className={`w-[120px] h-8 text-xs ${getStatusColor(ticket.status)}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-lg">
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            {ticket.status !== 'closed' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-500/10"
                onClick={handleEscalateTicket}
                disabled={isProcessing}
                title="Escalate"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Footer meta */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTicketDate(ticket.createdAt)}
          </span>
          {ticket.assignedTo && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {ticket.assignedTo.name}
            </span>
          )}
        </div>

        {/* Expanded content — consolidated to 3 tabs */}
        {isExpanded && (
          <div className="border-t border-border mt-3 pt-3">
            <Tabs defaultValue="comments" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="comments" className="text-xs gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Activity
                </TabsTrigger>
                <TabsTrigger value="time" className="text-xs gap-1">
                  <Timer className="h-3.5 w-3.5" />
                  Time
                </TabsTrigger>
                <TabsTrigger value="attachments" className="text-xs gap-1">
                  <Paperclip className="h-3.5 w-3.5" />
                  Files
                </TabsTrigger>
              </TabsList>

              <TabsContent value="comments" className="mt-3">
                <TicketComments
                  ticketId={ticket.id}
                  customerEmail={customerEmail}
                  customerName={customerName}
                />
              </TabsContent>

              <TabsContent value="time" className="mt-3">
                {onAddTimeEntry ? (
                  <TimeTracker
                    timeEntries={ticket.timeEntries || []}
                    totalTimeSpent={ticket.totalTimeSpent || 0}
                    onAddTimeEntry={handleAddTimeEntry}
                  />
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">Time tracking unavailable</p>
                )}
              </TabsContent>

              <TabsContent value="attachments" className="mt-3">
                <TicketAttachments ticketId={ticket.id} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {customerId && (
        <SatisfactionRating
          isOpen={showSatisfactionRating}
          onClose={() => setShowSatisfactionRating(false)}
          ticketId={ticket.id}
          customerId={customerId}
          ticketNumber={ticket.ticketNumber}
        />
      )}
    </>
  );
};

export default TicketCard;
