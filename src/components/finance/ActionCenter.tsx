import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CustomerTransaction } from '@/types/finance';
import { DollarSign, FileText, Flag, Send, RefreshCw, Bell, Calculator } from 'lucide-react';
import { financeBusinessLogic } from '@/services/financeBusinessLogic';
import { financeApiService } from '@/services/financeApiService';
import { toast } from '@/hooks/use-toast';
import { generateStatementPDF } from '@/utils/pdfExport';

interface ActionCenterProps {
  customerId: string;
  onAddTransaction: (transaction: Partial<CustomerTransaction>) => void;
  onRefresh?: () => void;
}

const ActionCenter = ({ customerId, onAddTransaction, onRefresh }: ActionCenterProps) => {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [reminderType, setReminderType] = useState<'payment_reminder' | 'overdue_payment' | 'account_flagged'>('payment_reminder');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleAddPayment = () => {
    if (!amount || !paymentMethod || !referenceNumber) return;

    onAddTransaction({
      transaction_type: 'payment',
      amount: parseFloat(amount),
      payment_method: paymentMethod,
      reference_number: referenceNumber,
      status: 'completed'
    });

    setAmount('');
    setPaymentMethod('');
    setReferenceNumber('');
    setPaymentDialogOpen(false);
  };

  const handleReconcileTransactions = async () => {
    setIsProcessing(true);
    try {
      const result = await financeBusinessLogic.reconcileTransactions(customerId, true);
      toast({
        title: "Reconciliation Complete",
        description: `Matched: ${result.results.matched}, Auto-matched: ${result.results.auto_matched}`,
      });
      onRefresh?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reconcile transactions",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCalculateSummary = async () => {
    setIsProcessing(true);
    try {
      await financeBusinessLogic.calculateAccountSummary(customerId);
      toast({
        title: "Summary Updated",
        description: "Account summary recalculated successfully",
      });
      onRefresh?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate summary",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendReminder = async () => {
    setIsProcessing(true);
    try {
      await financeBusinessLogic.sendNotification(
        customerId, 
        reminderType,
        customMessage || undefined
      );
      toast({
        title: "Reminder Sent",
        description: `${getReminderTypeLabel(reminderType)} sent successfully`,
      });
      setReminderDialogOpen(false);
      setCustomMessage('');
      setSelectedTemplate('');
      setReminderType('payment_reminder');
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

  const handleDownloadStatement = async () => {
    setIsProcessing(true);
    try {
      const result = await financeApiService.generateStatement(customerId);
      
      if (result?.statement_html && result?.customer_name) {
        await generateStatementPDF(result.customer_name, result.statement_html);
        toast({
          title: "Statement Downloaded",
          description: "PDF statement generated and downloaded successfully",
        });
      } else {
        throw new Error('Invalid statement data received');
      }
    } catch (error) {
      console.error('Statement generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate statement PDF",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFlagAccount = async () => {
    setIsProcessing(true);
    try {
      await financeBusinessLogic.sendNotification(customerId, 'account_flagged', 
        'Account flagged for manual review'
      );
      toast({
        title: "Account Flagged",
        description: "Account flagged and notification sent",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to flag account",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => setPaymentDialogOpen(true)}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Add Payment
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Amount</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Payment Method</label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="eft">EFT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Reference Number</label>
                  <Input
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="PAY-12345"
                  />
                </div>
                <Button onClick={handleAddPayment} className="w-full">
                  Record Payment
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={handleDownloadStatement}
            disabled={isProcessing}
          >
            <FileText className="h-4 w-4 mr-2" />
            Download Statement PDF
          </Button>

          <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => setReminderDialogOpen(true)}
            >
              <Bell className="h-4 w-4 mr-2" />
              Send Reminder
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Payment Reminder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Reminder Type</label>
                  <Select 
                    value={reminderType} 
                    onValueChange={(value) => {
                      setReminderType(value as any);
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

          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={handleReconcileTransactions}
            disabled={isProcessing}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reconcile Transactions
          </Button>

          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={handleCalculateSummary}
            disabled={isProcessing}
          >
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Summary
          </Button>

          <Button 
            className="w-full justify-start" 
            variant="outline"
            onClick={handleFlagAccount}
            disabled={isProcessing}
          >
            <Flag className="h-4 w-4 mr-2" />
            Flag Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionCenter;
