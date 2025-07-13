
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Send, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  Mail,
  Phone,
  Calendar
} from "lucide-react";
import { QuoteInvoice } from '@/types/quote';
import { toast } from "@/hooks/use-toast";

interface DocumentWorkflowManagerProps {
  quote: QuoteInvoice;
}

const DocumentWorkflowManager = ({ quote }: DocumentWorkflowManagerProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <FileText className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'overdue': return <Clock className="h-4 w-4 text-red-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      // This would typically update the quote status in the database
      toast({
        title: "Status Updated",
        description: `${quote.type} status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendDocument = async () => {
    try {
      toast({
        title: "Document Sent",
        description: `${quote.type} has been sent to ${quote.customer_email}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send document",
        variant: "destructive"
      });
    }
  };

  const workflowSteps = [
    { step: 'Created', status: 'draft', completed: true },
    { step: 'Sent', status: 'sent', completed: quote.status !== 'draft' },
    { step: quote.type === 'quote' ? 'Accepted' : 'Paid', status: quote.type === 'quote' ? 'accepted' : 'paid', completed: quote.status === 'accepted' || quote.status === 'paid' },
  ];

  return (
    <div className="space-y-6">
      {/* Document Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(quote.status)}
            Document Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">{quote.number}</h3>
              <p className="text-sm text-quikle-slate">{quote.customer_name}</p>
            </div>
            <Badge className={getStatusColor(quote.status)} variant="secondary">
              {quote.status}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-quikle-slate">Amount:</span>
              <p className="font-medium">${quote.total.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-quikle-slate">Created:</span>
              <p className="font-medium">{new Date(quote.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-quikle-slate">
                {quote.type === 'quote' ? 'Valid Until:' : 'Due Date:'}
              </span>
              <p className="font-medium">
                {quote.type === 'quote' 
                  ? (quote.valid_until ? new Date(quote.valid_until).toLocaleDateString() : 'No expiry')
                  : (quote.due_date ? new Date(quote.due_date).toLocaleDateString() : 'No due date')
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {workflowSteps.map((step, index) => (
              <div key={step.step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {step.completed ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                </div>
                <span className={`ml-2 text-sm ${step.completed ? 'text-green-600' : 'text-gray-400'}`}>
                  {step.step}
                </span>
                {index < workflowSteps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    step.completed ? 'bg-green-200' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleSendDocument} disabled={isUpdating}>
              <Mail className="h-4 w-4 mr-2" />
              Send via Email
            </Button>
            <Button variant="outline">
              <Phone className="h-4 w-4 mr-2" />
              Send via WhatsApp
            </Button>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Follow-up
            </Button>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Update Status</label>
              <Select value={quote.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
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
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentWorkflowManager;
