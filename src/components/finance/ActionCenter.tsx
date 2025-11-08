import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomerTransaction } from '@/types/finance';
import { DollarSign, FileText, Flag, Send, RefreshCw, Bell, Calculator } from 'lucide-react';
import { financeBusinessLogic } from '@/services/financeBusinessLogic';
import { financeApiService } from '@/services/financeApiService';
import { toast } from '@/hooks/use-toast';

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
  const [isProcessing, setIsProcessing] = useState(false);

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

  const getReminderTypeLabel = (type: string) => {
    switch (type) {
      case 'payment_reminder': return 'Payment reminder';
      case 'overdue_payment': return 'Overdue payment notification';
      case 'account_flagged': return 'Account flagged notification';
      default: return 'Notification';
    }
  };

  const handleSendStatement = async () => {
    setIsProcessing(true);
    try {
      const result = await financeApiService.generateStatement(customerId);
      toast({
        title: "Statement Generated",
        description: "Customer statement generated successfully",
      });
      // Could download or open the statement here
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate statement",
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
            onClick={handleSendStatement}
            disabled={isProcessing}
          >
            <Send className="h-4 w-4 mr-2" />
            Send Statement
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
                    onValueChange={(value) => setReminderType(value as any)}
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
                  <label className="text-sm font-medium">Custom Message (Optional)</label>
                  <Input
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Add a personalized message..."
                  />
                </div>
                <Button 
                  onClick={handleSendReminder} 
                  className="w-full"
                  disabled={isProcessing}
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
