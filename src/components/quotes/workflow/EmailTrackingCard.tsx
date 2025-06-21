
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Mail, Eye, MousePointer, Clock, CheckCircle } from "lucide-react";
import { QuoteInvoice } from '@/types/quote';

interface EmailTrackingCardProps {
  quote: QuoteInvoice;
}

interface EmailEvent {
  id: string;
  type: 'sent' | 'delivered' | 'opened' | 'clicked';
  timestamp: string;
  description: string;
}

const EmailTrackingCard = ({ quote }: EmailTrackingCardProps) => {
  const [emailEvents, setEmailEvents] = useState<EmailEvent[]>([
    {
      id: '1',
      type: 'sent',
      timestamp: '2024-01-20 10:00:00',
      description: 'Email sent to customer'
    },
    {
      id: '2',
      type: 'delivered',
      timestamp: '2024-01-20 10:01:30',
      description: 'Email delivered successfully'
    },
    {
      id: '3',
      type: 'opened',
      timestamp: '2024-01-20 14:30:00',
      description: 'Email opened by customer'
    }
  ]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'sent': return <Mail className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'opened': return <Eye className="h-4 w-4" />;
      case 'clicked': return <MousePointer className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'sent': return 'bg-blue-500';
      case 'delivered': return 'bg-green-500';
      case 'opened': return 'bg-orange-500';
      case 'clicked': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getProgressValue = () => {
    const eventTypes = ['sent', 'delivered', 'opened', 'clicked'];
    const completedEvents = emailEvents.map(e => e.type);
    const progress = (completedEvents.length / eventTypes.length) * 100;
    return Math.min(progress, 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Delivery Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Delivery Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(getProgressValue())}%</span>
          </div>
          <Progress value={getProgressValue()} className="h-2" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <Mail className="h-6 w-6 mx-auto mb-2 text-blue-500" />
            <p className="text-sm font-medium">Sent</p>
            <Badge variant="outline" className="text-xs">
              {emailEvents.some(e => e.type === 'sent') ? 'Yes' : 'No'}
            </Badge>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <p className="text-sm font-medium">Delivered</p>
            <Badge variant="outline" className="text-xs">
              {emailEvents.some(e => e.type === 'delivered') ? 'Yes' : 'No'}
            </Badge>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <Eye className="h-6 w-6 mx-auto mb-2 text-orange-500" />
            <p className="text-sm font-medium">Opened</p>
            <Badge variant="outline" className="text-xs">
              {emailEvents.some(e => e.type === 'opened') ? 'Yes' : 'No'}
            </Badge>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <MousePointer className="h-6 w-6 mx-auto mb-2 text-purple-500" />
            <p className="text-sm font-medium">Clicked</p>
            <Badge variant="outline" className="text-xs">
              {emailEvents.some(e => e.type === 'clicked') ? 'Yes' : 'No'}
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Email Timeline</h4>
          <div className="space-y-3">
            {emailEvents.map((event, index) => (
              <div key={event.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${getEventColor(event.type)} flex items-center justify-center text-white`}>
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.description}</p>
                  <p className="text-xs text-muted-foreground">{event.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Resend Email
          </Button>
          <Button variant="outline" size="sm">
            View Full Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailTrackingCard;
