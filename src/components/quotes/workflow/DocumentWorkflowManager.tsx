import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  ArrowRight,
  Mail,
  Eye,
  Download,
  MessageSquare,
  Calendar,
  User,
  Activity
} from "lucide-react";
import { QuoteInvoice, QuoteInvoiceStatus } from '@/types/quote';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

interface DocumentWorkflowManagerProps {
  quote: QuoteInvoice;
}

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'completed' | 'skipped';
  date?: string;
  icon: React.ReactNode;
}

interface ActivityLog {
  id: string;
  activity: string;
  user: string;
  timestamp: string;
  type: 'status_change' | 'email_sent' | 'viewed' | 'downloaded' | 'comment';
}

const DocumentWorkflowManager = ({ quote }: DocumentWorkflowManagerProps) => {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [statusComment, setStatusComment] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    generateWorkflowSteps();
    loadActivityLog();
  }, [quote]);

  const generateWorkflowSteps = () => {
    const steps: WorkflowStep[] = [
      {
        id: 'created',
        name: 'Document Created',
        status: 'completed',
        date: quote.created_at,
        icon: <FileText className="h-4 w-4" />
      },
      {
        id: 'sent',
        name: 'Sent to Customer',
        status: quote.status === 'sent' || quote.status === 'accepted' || quote.status === 'paid' ? 'completed' : 'pending',
        icon: <Send className="h-4 w-4" />
      },
      {
        id: 'viewed',
        name: 'Viewed by Customer',
        status: 'pending', // This would be tracked via analytics
        icon: <Eye className="h-4 w-4" />
      }
    ];

    if (quote.type === 'quote') {
      steps.push({
        id: 'accepted',
        name: 'Quote Accepted',
        status: quote.status === 'accepted' ? 'completed' : quote.status === 'rejected' ? 'skipped' : 'pending',
        icon: <CheckCircle className="h-4 w-4" />
      });
    } else {
      steps.push({
        id: 'paid',
        name: 'Payment Received',
        status: quote.status === 'paid' ? 'completed' : quote.status === 'overdue' ? 'pending' : 'pending',
        icon: <DollarSign className="h-4 w-4" />
      });
    }

    setWorkflowSteps(steps);
  };

  const loadActivityLog = () => {
    // Mock activity log - in real implementation, this would come from the database
    const mockActivities: ActivityLog[] = [
      {
        id: '1',
        activity: `${quote.type} created`,
        user: 'System',
        timestamp: quote.created_at,
        type: 'status_change'
      },
      {
        id: '2',
        activity: `Status changed to ${quote.status}`,
        user: 'Admin',
        timestamp: quote.updated_at,
        type: 'status_change'
      }
    ];
    setActivityLog(mockActivities);
  };

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      // Type assertion to ensure the status is valid
      const validStatus = newStatus as QuoteInvoiceStatus;
      
      const { error } = await supabase
        .from('quotes_invoices')
        .update({ 
          status: validStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', quote.id);

      if (error) throw error;

      // Add activity log entry
      if (statusComment.trim()) {
        // In real implementation, save to activity log table
        const newActivity: ActivityLog = {
          id: Date.now().toString(),
          activity: `Status changed to ${newStatus}${statusComment ? ` - ${statusComment}` : ''}`,
          user: 'Current User',
          timestamp: new Date().toISOString(),
          type: 'status_change'
        };
        setActivityLog(prev => [newActivity, ...prev]);
        setStatusComment('');
      }

      generateWorkflowSteps();
      
      toast({
        title: "Success",
        description: `${quote.type} status updated successfully`
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const sendEmail = async () => {
    // Mock email sending
    toast({
      title: "Email Sent",
      description: `${quote.type} sent to ${quote.customer_email}`
    });
    
    const newActivity: ActivityLog = {
      id: Date.now().toString(),
      activity: `Email sent to ${quote.customer_email}`,
      user: 'Current User',
      timestamp: new Date().toISOString(),
      type: 'email_sent'
    };
    setActivityLog(prev => [newActivity, ...prev]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-emerald-100 text-emerald-800';
      case 'overdue': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = () => {
    const completedSteps = workflowSteps.filter(step => step.status === 'completed').length;
    return (completedSteps / workflowSteps.length) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-quikle-charcoal">Document Workflow</h2>
          <p className="text-quikle-slate">
            {quote.type} #{quote.number} - {quote.customer_name}
          </p>
        </div>
        <Badge className={getStatusColor(quote.status)}>
          {quote.status.toUpperCase()}
        </Badge>
      </div>

      <Tabs defaultValue="workflow" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workflow">Workflow Progress</TabsTrigger>
          <TabsTrigger value="actions">Quick Actions</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Workflow Progress</span>
                  <span className="text-sm font-normal text-quikle-slate">
                    {Math.round(getProgressPercentage())}% Complete
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={getProgressPercentage()} className="w-full" />
                
                <div className="space-y-3">
                  {workflowSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className={`p-2 rounded-full ${
                        step.status === 'completed' ? 'bg-green-100 text-green-600' :
                        step.status === 'skipped' ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-400'
                      }`}>
                        {step.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{step.name}</h4>
                          <Badge variant={
                            step.status === 'completed' ? 'default' :
                            step.status === 'skipped' ? 'destructive' :
                            'secondary'
                          }>
                            {step.status}
                          </Badge>
                        </div>
                        {step.date && (
                          <p className="text-sm text-quikle-slate">
                            {new Date(step.date).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {index < workflowSteps.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="actions" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Update Status</Label>
                    <Select onValueChange={updateStatus} disabled={updating}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        {quote.type === 'quote' && (
                          <>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </>
                        )}
                        {quote.type === 'invoice' && (
                          <>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status Comment (Optional)</Label>
                  <Textarea
                    value={statusComment}
                    onChange={(e) => setStatusComment(e.target.value)}
                    placeholder="Add a comment about this status change..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Communication Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={sendEmail} className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Send Email
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Send SMS
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLog.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border-l-2 border-quikle-primary/20">
                    <div className="p-1 rounded-full bg-quikle-primary/10">
                      {activity.type === 'status_change' && <Clock className="h-3 w-3 text-quikle-primary" />}
                      {activity.type === 'email_sent' && <Mail className="h-3 w-3 text-quikle-primary" />}
                      {activity.type === 'viewed' && <Eye className="h-3 w-3 text-quikle-primary" />}
                      {activity.type === 'downloaded' && <Download className="h-3 w-3 text-quikle-primary" />}
                      {activity.type === 'comment' && <MessageSquare className="h-3 w-3 text-quikle-primary" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.activity}</p>
                      <div className="flex items-center gap-2 text-xs text-quikle-slate mt-1">
                        <User className="h-3 w-3" />
                        <span>{activity.user}</span>
                        <Calendar className="h-3 w-3 ml-2" />
                        <span>{new Date(activity.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentWorkflowManager;
