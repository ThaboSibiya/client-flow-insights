import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Bell, Send, AlertTriangle } from 'lucide-react';
import { RiskRating } from '@/types/finance';
import { QuoteInvoice } from '@/types/quote';
import { invoiceService } from '@/services/invoiceService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ReminderWorkflowProps {
  customerId: string;
  currentBalance: number;
  riskRating: RiskRating;
  onReminderSent?: () => void;
}

type ReminderType = 'payment_reminder' | 'overdue_payment' | 'account_flagged';

const ReminderWorkflow = ({ customerId, currentBalance, riskRating, onReminderSent }: ReminderWorkflowProps) => {
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [reminderType, setReminderType] = useState<ReminderType>('payment_reminder');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [invoices, setInvoices] = useState<QuoteInvoice[]>([]);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);

  const reminderTemplates = {
    payment_reminder: {
      default: "This is a friendly reminder that you have an outstanding balance on your account. Please review your account and make a payment at your earliest convenience.",
      gentle: "We wanted to reach out regarding your account balance. If you need assistance with payment arrangements, please don't hesitate to contact us.",
      urgent: "We notice you have an outstanding balance. To avoid any service interruptions, please make a payment as soon as possible."
    },
    overdue_payment: {
      default: "Your payment is now overdue. Please submit your payment immediately to avoid late fees and service interruption.",
      firm: "This is an urgent notice regarding your overdue payment. Immediate action is required to prevent additional charges and account suspension.",
      final: "FINAL NOTICE: Your payment is severely overdue. Please contact us immediately to resolve this matter and avoid further action."
    },
    account_flagged: {
      default: "Your account has been flagged for review. Please contact our office to discuss your account status and payment options.",
      review: "We need to discuss some concerns with your account. Please reach out to us at your earliest convenience to resolve any issues.",
      action: "Your account requires immediate attention. Please contact us within 48 hours to prevent account restrictions."
    }
  };

  useEffect(() => {
    const fetchCustomerInvoices = async () => {
      try {
        const data = await invoiceService.getCustomerInvoices(customerId);
        setInvoices(data);
      } catch (error) {
        console.error('Failed to fetch invoices:', error);
      }
    };

    if (reminderDialogOpen) {
      fetchCustomerInvoices();
    }
  }, [customerId, reminderDialogOpen]);

  const getSuggestedReminderType = (): ReminderType => {
    if (riskRating === 'critical' || riskRating === 'high') {
      return 'overdue_payment';
    }
    return 'payment_reminder';
  };

  const handleSendReminder = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-reminder-with-invoices', {
        body: {
          customerId,
          reminderType,
          customMessage: customMessage || undefined,
          invoiceIds: selectedInvoiceIds
        }
      });

      if (error) throw error;

      toast({
        title: "Reminder Sent",
        description: `${getReminderTypeLabel(reminderType)} sent successfully${selectedInvoiceIds.length > 0 ? ` with ${selectedInvoiceIds.length} invoice(s) attached` : ''}`,
      });
      
      setReminderDialogOpen(false);
      setCustomMessage('');
      setSelectedTemplate('');
      setReminderType('payment_reminder');
      setSelectedInvoiceIds([]);
      onReminderSent?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reminder",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template);
    const templates = reminderTemplates[reminderType];
    if (templates && template in templates) {
      setCustomMessage(templates[template as keyof typeof templates]);
    }
  };

  const getReminderTypeLabel = (type: string) => {
    switch (type) {
      case 'payment_reminder': return 'Payment reminder';
      case 'overdue_payment': return 'Overdue payment notification';
      case 'account_flagged': return 'Account flagged notification';
      default: return 'Notification';
    }
  };

  const toggleInvoiceSelection = (invoiceId: string) => {
    setSelectedInvoiceIds(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Send Reminder
          </CardTitle>
          {(riskRating === 'high' || riskRating === 'critical') && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {riskRating === 'critical' ? 'CRITICAL' : 'HIGH RISK'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Outstanding Balance</p>
              <p className="text-2xl font-bold text-destructive">R{currentBalance.toFixed(2)}</p>
            </div>
            <Button 
              onClick={() => {
                setReminderType(getSuggestedReminderType());
                setReminderDialogOpen(true);
              }}
              variant={riskRating === 'critical' || riskRating === 'high' ? 'destructive' : 'default'}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Reminder
            </Button>
          </div>

          <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Send Payment Reminder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Reminder Type</label>
                  <Select 
                    value={reminderType} 
                    onValueChange={(value) => {
                      setReminderType(value as ReminderType);
                      setSelectedTemplate('');
                      setCustomMessage('');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment_reminder">Payment Reminder</SelectItem>
                      <SelectItem value="overdue_payment">Overdue Payment</SelectItem>
                      <SelectItem value="account_flagged">Account Flagged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Message Template</label>
                  <Select 
                    value={selectedTemplate} 
                    onValueChange={handleTemplateSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {reminderType === 'payment_reminder' && (
                        <>
                          <SelectItem value="default">Friendly Reminder</SelectItem>
                          <SelectItem value="gentle">Gentle Follow-up</SelectItem>
                          <SelectItem value="urgent">Urgent Notice</SelectItem>
                        </>
                      )}
                      {reminderType === 'overdue_payment' && (
                        <>
                          <SelectItem value="default">Standard Overdue</SelectItem>
                          <SelectItem value="firm">Firm Notice</SelectItem>
                          <SelectItem value="final">Final Notice</SelectItem>
                        </>
                      )}
                      {reminderType === 'account_flagged' && (
                        <>
                          <SelectItem value="default">Account Review</SelectItem>
                          <SelectItem value="review">Review Required</SelectItem>
                          <SelectItem value="action">Action Required</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Add or customize your message..."
                    rows={5}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Attach Invoices (Optional)</label>
                  {invoices.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No unpaid invoices available</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                      {invoices.map((invoice) => (
                        <div key={invoice.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={invoice.id}
                            checked={selectedInvoiceIds.includes(invoice.id)}
                            onCheckedChange={() => toggleInvoiceSelection(invoice.id)}
                          />
                          <label
                            htmlFor={invoice.id}
                            className="text-sm flex-1 flex justify-between items-center cursor-pointer"
                          >
                            <span>{invoice.number}</span>
                            <span className="font-medium text-destructive">
                              R{invoice.total?.toFixed(2)}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleSendReminder} 
                  className="w-full"
                  disabled={isProcessing || !customMessage}
                >
                  {isProcessing ? 'Sending...' : 'Send Reminder'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReminderWorkflow;
