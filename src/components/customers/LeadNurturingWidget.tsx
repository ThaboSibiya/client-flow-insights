
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  CheckCircle,
  UserPlus,
  Bell,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { Customer } from '@/types/customer';
import { useLeadNurturing } from '@/hooks/useLeadNurturing';

interface LeadNurturingWidgetProps {
  customer: Customer;
  onUpdate?: () => void;
}

const LeadNurturingWidget = ({ customer, onUpdate }: LeadNurturingWidgetProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { 
    autoAssignLead, 
    setupFollowUpReminders, 
    createNextStepTasks 
  } = useLeadNurturing();

  const handleAutoAssign = async () => {
    setIsProcessing(true);
    try {
      await autoAssignLead(customer);
      onUpdate?.();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetupFollowUp = async () => {
    setIsProcessing(true);
    try {
      await setupFollowUpReminders(customer.id);
      onUpdate?.();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateTasks = async () => {
    setIsProcessing(true);
    try {
      await createNextStepTasks(customer);
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

  const getNextStepDescription = () => {
    switch (customer.status) {
      case 'new':
        return 'Initial contact and qualification needed';
      case 'existing':
        return 'Needs assessment and service presentation';
      case 'pending':
        return 'Follow up on pending decision';
      case 'finalised':
        return 'Post-sale follow up and satisfaction check';
      default:
        return 'No specific next steps defined';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          Lead Nurturing Automation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <Badge className={getStatusColor(customer.status)}>
              {customer.status}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Updated: {customer.updatedAt.toLocaleDateString()}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 text-blue-500 mt-1" />
            <div>
              <p className="text-sm font-medium">Next Steps</p>
              <p className="text-sm text-muted-foreground">
                {getNextStepDescription()}
              </p>
            </div>
          </div>
        </div>

        {/* Automation Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoAssign}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Auto-Assign
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSetupFollowUp}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Follow-up
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateTasks}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Create Tasks
          </Button>
        </div>

        {/* Automation Status Indicators */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-500" />
            <span>Assignment: {customer.assigned_to ? 'Active' : 'Pending'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span>Follow-ups: Scheduled</span>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="border-t pt-3">
          <p className="text-xs text-muted-foreground mb-2">Automation Metrics</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-lg font-semibold text-blue-600">3</p>
              <p className="text-xs text-muted-foreground">Days avg response</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-green-600">85%</p>
              <p className="text-xs text-muted-foreground">Follow-up rate</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-purple-600">12</p>
              <p className="text-xs text-muted-foreground">Tasks created</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadNurturingWidget;
