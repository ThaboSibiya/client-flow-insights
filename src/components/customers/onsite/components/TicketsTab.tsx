
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";
import { OnSiteTicket } from '../types';

interface TicketsTabProps {
  tickets: OnSiteTicket[];
  loading: boolean;
}

export const TicketsTab = ({ tickets, loading }: TicketsTabProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-600">Loading tickets...</p>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-6">
        <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
        <p className="text-gray-500">No pending tickets for this customer</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-60 overflow-y-auto">
      {tickets.map((ticket) => (
        <Card key={ticket.id} className="border-l-4 border-l-blue-500">
          <CardContent className="p-3">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-sm text-gray-900">{ticket.ticket_number}</h4>
                <p className="text-sm text-gray-600 mt-1">{ticket.subject}</p>
              </div>
              <div className="flex gap-1 ml-2">
                <Badge className={getPriorityColor(ticket.priority)} variant="outline">
                  {ticket.priority === 'urgent' && <AlertCircle className="h-3 w-3 mr-1" />}
                  {ticket.priority}
                </Badge>
                <Badge className={getStatusColor(ticket.status)} variant="outline">
                  {ticket.status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              <span>Created {formatDate(ticket.created_at)}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
