import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomerTransaction, TransactionType } from '@/types/finance';
import { DollarSign, FileText, Flag, Send } from 'lucide-react';

interface ActionCenterProps {
  onAddTransaction: (transaction: Partial<CustomerTransaction>) => void;
}

const ActionCenter = ({ onAddTransaction }: ActionCenterProps) => {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');

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

          <Button className="w-full justify-start" variant="outline">
            <Send className="h-4 w-4 mr-2" />
            Send Statement
          </Button>

          <Button className="w-full justify-start" variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Generate Invoice
          </Button>

          <Button className="w-full justify-start" variant="outline">
            <Flag className="h-4 w-4 mr-2" />
            Flag Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionCenter;
