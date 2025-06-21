
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  Send,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Customer } from '@/types/customer';
import { useCommunicationAutomation } from '@/hooks/useCommunicationAutomation';

interface CommunicationAutomationWidgetProps {
  customer: Customer;
  onUpdate?: () => void;
}

const CommunicationAutomationWidget = ({ customer, onUpdate }: CommunicationAutomationWidgetProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { 
    triggerWelcomeSequence,
    sendUrgentStatusSMS,
    sendJobCompletionWhatsApp,
    scheduleFollowUpCall
  } = useCommunicationAutomation();

  const handleWelcomeSequence = async () => {
    setIsProcessing(true);
    try {
      await triggerWelcomeSequence(customer);
      onUpdate?.();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendSMS = async () => {
    setIsProcessing(true);
    try {
      await sendUrgentStatusSMS(customer, 'existing', customer.status);
      onUpdate?.();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWhatsAppNotification = async () => {
    setIsProcessing(true);
    try {
      await sendJobCompletionWhatsApp(customer, {
        type: 'service',
        nextSteps: 'Follow-up call scheduled within 24 hours'
      });
      onUpdate?.();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScheduleCall = async (callType: 'welcome' | 'check_in' | 'feedback') => {
    setIsProcessing(true);
    try {
      const hoursFromNow = callType === 'welcome' ? 2 : callType === 'feedback' ? 24 : 72;
      await scheduleFollowUpCall(customer, callType, hoursFromNow);
      onUpdate?.();
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'existing': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'finalised': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-green-500" />
          Communication Automation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Communication Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <Badge className={getStatusColor(customer.status)}>
              {customer.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {customer.phone && <Phone className="h-4 w-4" />}
            {customer.email && <Mail className="h-4 w-4" />}
          </div>
        </div>

        {/* Communication Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleWelcomeSequence}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Start Welcome Sequence
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSendSMS}
            disabled={isProcessing || !customer.phone}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Send Status SMS
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleWhatsAppNotification}
            disabled={isProcessing || !customer.phone}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            WhatsApp Update
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleScheduleCall('welcome')}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            <Phone className="h-4 w-4" />
            Schedule Call
          </Button>
        </div>

        {/* Communication Preferences */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-500 mt-1" />
            <div>
              <p className="text-sm font-medium">Communication Preferences</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  <Mail className="h-3 w-3 mr-1" />
                  Email: Enabled
                </Badge>
                {customer.phone && (
                  <Badge variant="secondary" className="text-xs">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    SMS: Available
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Immediate
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Communication Activity */}
        <div className="border-t pt-3">
          <p className="text-xs text-muted-foreground mb-2">Recent Activity</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Welcome email sent</span>
              <span className="text-muted-foreground text-xs ml-auto">2 hours ago</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>Follow-up call scheduled</span>
              <span className="text-muted-foreground text-xs ml-auto">Tomorrow</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div>
            <p className="text-lg font-semibold text-blue-600">5</p>
            <p className="text-xs text-muted-foreground">Emails sent</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-green-600">2</p>
            <p className="text-xs text-muted-foreground">SMS sent</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-purple-600">3</p>
            <p className="text-xs text-muted-foreground">Calls scheduled</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunicationAutomationWidget;
