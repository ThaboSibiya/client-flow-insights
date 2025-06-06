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
import { User, Clock, AlertCircle, Timer, ChevronDown, ChevronUp, History, Star } from 'lucide-react';
import TimeTracker from './TimeTracker';
import TicketAttachments from './TicketAttachments';
import TicketComments from './TicketComments';
import TicketHistory, { TicketHistoryItem } from './TicketHistory';
import SatisfactionRating from './SatisfactionRating';
import { sendTicketNotification } from '@/services/ticketNotificationService';

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

  // Generate sample history data - in real app, this would come from the database
  const generateTicketHistory = (): TicketHistoryItem[] => {
    return [
      {
        id: '1',
        type: 'created',
        timestamp: ticket.createdAt,
        user: 'Customer',
        details: {}
      },
      {
        id: '2',
        type: 'status_change',
        timestamp: new Date(ticket.createdAt.getTime() + 30000),
        user: 'Support Agent',
        details: {
          oldStatus: 'new',
          newStatus: ticket.status
        }
      }
    ];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleStatusUpdate = async (newStatus: TicketStatus) => {
    const oldStatus = ticket.status;
    onStatusUpdate(ticket.id, newStatus);

    // Send email notification if customer info is available
    if (customerEmail && customerName && oldStatus !== newStatus) {
      await sendTicketNotification({
        ticketId: ticket.id,
        customerEmail,
        customerName,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        type: 'status_changed',
        details: {
          oldStatus,
          newStatus,
        }
      });
    }

    // Show satisfaction rating dialog when ticket is resolved or closed
    if ((newStatus === 'resolved' || newStatus === 'closed') && customerId && oldStatus !== newStatus) {
      setShowSatisfactionRating(true);
    }
  };

  const handleAddTimeEntry = (timeEntry: any) => {
    if (onAddTimeEntry) {
      onAddTimeEntry(ticket.id, timeEntry);
    }
  };

  return (
    <>
      <div className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-sm">{ticket.ticketNumber}</h4>
              <Badge className={getPriorityColor(ticket.priority)}>
                {ticket.priority === 'urgent' && <AlertCircle className="h-3 w-3 mr-1" />}
                {ticket.priority}
              </Badge>
              {ticket.totalTimeSpent > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Timer className="h-3 w-3 mr-1" />
                  {formatTime(ticket.totalTimeSpent)}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{ticket.subject}</h3>
            {ticket.description && (
              <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={ticket.status} onValueChange={handleStatusUpdate}>
              <SelectTrigger className={`w-32 ${getStatusColor(ticket.status)}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-2"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t pt-4">
            <Tabs defaultValue="comments" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="history">
                  <History className="h-4 w-4 mr-1" />
                  History
                </TabsTrigger>
                <TabsTrigger value="time">Time Tracking</TabsTrigger>
                <TabsTrigger value="attachments">Attachments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="comments" className="mt-4">
                <TicketComments 
                  ticketId={ticket.id} 
                  customerEmail={customerEmail}
                  customerName={customerName}
                />
              </TabsContent>
              
              <TabsContent value="history" className="mt-4">
                <TicketHistory
                  history={generateTicketHistory()}
                  formatDate={(dateString) => formatDate(new Date(dateString))}
                />
              </TabsContent>
              
              <TabsContent value="time" className="mt-4">
                {onAddTimeEntry && (
                  <TimeTracker
                    timeEntries={ticket.timeEntries || []}
                    totalTimeSpent={ticket.totalTimeSpent || 0}
                    onAddTimeEntry={handleAddTimeEntry}
                  />
                )}
              </TabsContent>
              
              <TabsContent value="attachments" className="mt-4">
                <TicketAttachments ticketId={ticket.id} />
              </TabsContent>
            </Tabs>
          </div>
        )}

        <div className="flex justify-between items-center text-xs text-gray-500 mt-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Created {formatDate(ticket.createdAt)}</span>
            </div>
            {ticket.assignedTo && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>Assigned to {ticket.assignedTo.name}</span>
              </div>
            )}
          </div>
          {ticket.updatedAt && ticket.updatedAt !== ticket.createdAt && (
            <span>Updated {formatDate(ticket.updatedAt)}</span>
          )}
        </div>
      </div>

      {/* Satisfaction Rating Dialog */}
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
