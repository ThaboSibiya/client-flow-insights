import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Send } from 'lucide-react';
import { DebtorCustomer } from '@/hooks/useDebtorData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { financeEventBus, FINANCE_EVENTS } from '@/stores/financeStore';

interface BulkReminderPanelProps {
  debtors: DebtorCustomer[];
  onSuccess: () => void;
}

const BulkReminderPanel = ({ debtors, onSuccess }: BulkReminderPanelProps) => {
  const { toast } = useToast();
  const [selectedDebtors, setSelectedDebtors] = useState<string[]>([]);
  const [reminderType, setReminderType] = useState('payment_reminder');
  const [customMessage, setCustomMessage] = useState('');
  const [includeInvoices, setIncludeInvoices] = useState(true);
  const [sending, setSending] = useState(false);

  const templates = {
    payment_reminder: `Dear [Customer Name],

This is a friendly reminder that you have outstanding invoices that are past due. Please review the attached invoices and arrange payment at your earliest convenience.

If you have any questions or concerns, please don't hesitate to contact us.

Thank you for your prompt attention to this matter.`,
    overdue_payment: `Dear [Customer Name],

We notice that payment for the following invoices is now overdue. Immediate payment is required to avoid any service disruptions.

Please contact us immediately to arrange payment or discuss payment options.

Thank you for your cooperation.`,
    final_notice: `Dear [Customer Name],

This is a final notice regarding your overdue account. Despite previous reminders, payment has not been received.

If payment is not received within 7 days, we will be forced to take further action including possible suspension of services or referral to a collections agency.

Please contact us immediately to resolve this matter.`,
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDebtors(debtors.map(d => d.id));
    } else {
      setSelectedDebtors([]);
    }
  };

  const handleSelectDebtor = (debtorId: string, checked: boolean) => {
    if (checked) {
      setSelectedDebtors([...selectedDebtors, debtorId]);
    } else {
      setSelectedDebtors(selectedDebtors.filter(id => id !== debtorId));
    }
  };

  const handleSendReminders = async () => {
    if (selectedDebtors.length === 0) {
      toast({
        title: 'No Recipients',
        description: 'Please select at least one debtor to send reminders.',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      // Call edge function for each selected debtor
      for (const debtorId of selectedDebtors) {
        const debtor = debtors.find(d => d.id === debtorId);
        if (!debtor) continue;

        const invoiceIds = includeInvoices 
          ? debtor.overdue_invoices?.map(inv => inv.id) || []
          : [];

        const { error } = await supabase.functions.invoke('send-reminder-with-invoices', {
          body: {
            customerId: debtorId,
            reminderType,
            customMessage: customMessage || templates[reminderType as keyof typeof templates],
            invoiceIds,
          },
        });

        if (error) {
          console.error(`Error sending reminder to ${debtor.name}:`, error);
        }
      }

      // Emit events for all affected customers
      selectedDebtors.forEach(debtorId => {
        financeEventBus.emit(FINANCE_EVENTS.REMINDER_SENT, { customerId: debtorId, reminderType });
      });

      toast({
        title: 'Reminders Sent',
        description: `Successfully sent reminders to ${selectedDebtors.length} customer(s).`,
      });

      setSelectedDebtors([]);
      setCustomMessage('');
      onSuccess();
    } catch (error) {
      console.error('Error sending bulk reminders:', error);
      toast({
        title: 'Error',
        description: 'Failed to send some reminders. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Recipients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Select Recipients</span>
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={selectedDebtors.length === debtors.length}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="text-sm font-normal cursor-pointer">
                Select All ({debtors.length})
              </Label>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {debtors.map((debtor) => (
              <div key={debtor.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <Checkbox
                  id={debtor.id}
                  checked={selectedDebtors.includes(debtor.id)}
                  onCheckedChange={(checked) => handleSelectDebtor(debtor.id, checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor={debtor.id} className="cursor-pointer">
                    <div className="font-semibold">{debtor.name}</div>
                    <div className="text-xs text-muted-foreground">{debtor.email}</div>
                    <div className="text-xs mt-1">
                      <span className="text-red-600 font-semibold">
                        {formatCurrency(debtor.total_overdue || 0)} overdue
                      </span>
                      {' • '}
                      <span className="text-muted-foreground">
                        {debtor.overdue_invoices?.length || 0} invoice(s)
                      </span>
                    </div>
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Right: Message Configuration */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Reminder Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Reminder Type</Label>
              <Select value={reminderType} onValueChange={setReminderType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment_reminder">Payment Reminder</SelectItem>
                  <SelectItem value="overdue_payment">Overdue Payment Notice</SelectItem>
                  <SelectItem value="final_notice">Final Notice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="include-invoices"
                checked={includeInvoices}
                onCheckedChange={(checked) => setIncludeInvoices(checked as boolean)}
              />
              <Label htmlFor="include-invoices" className="cursor-pointer">
                Attach invoice PDFs to emails
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Custom Message (Optional)</Label>
              <Textarea
                placeholder={templates[reminderType as keyof typeof templates]}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use default template. Use [Customer Name] for personalization.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Ready to Send</p>
                <p className="text-sm text-muted-foreground">
                  {selectedDebtors.length} recipient(s) selected
                </p>
              </div>
              <Button
                onClick={handleSendReminders}
                disabled={sending || selectedDebtors.length === 0}
                size="lg"
              >
                <Send className="h-4 w-4 mr-2" />
                {sending ? 'Sending...' : 'Send Reminders'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BulkReminderPanel;
