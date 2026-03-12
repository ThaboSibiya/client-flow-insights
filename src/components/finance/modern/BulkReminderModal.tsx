import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { DebtorCustomer } from '@/hooks/useDebtorData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { financeEventBus, FINANCE_EVENTS } from '@/stores/financeStore';
import { cn } from '@/lib/utils';

interface BulkReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debtors: DebtorCustomer[];
  onSuccess: () => void;
}

const BulkReminderModal = ({ 
  open, 
  onOpenChange, 
  debtors,
  onSuccess 
}: BulkReminderModalProps) => {
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ sent: 0, failed: 0, total: 0 });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === debtors.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(debtors.map(d => d.id)));
    }
  };

  const handleSend = async () => {
    if (selectedIds.size === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select at least one debtor.',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    const selectedDebtors = debtors.filter(d => selectedIds.has(d.id));
    let sent = 0;
    let failed = 0;
    setProgress({ sent: 0, failed: 0, total: selectedDebtors.length });

    for (const debtor of selectedDebtors) {
      try {
        const invoiceIds = debtor.overdue_invoices?.map(inv => inv.id) || [];

        const { error } = await supabase.functions.invoke('send-reminder-with-invoices', {
          body: {
            customerId: debtor.id,
            reminderType: 'payment_reminder',
            invoiceIds,
          },
        });

        if (error) {
          console.error(`Failed to send reminder to ${debtor.name}:`, error);
          failed++;
        } else {
          sent++;
          financeEventBus.emit(FINANCE_EVENTS.REMINDER_SENT, { 
            customerId: debtor.id, 
            reminderType: 'payment_reminder' 
          });
        }
      } catch (error) {
        console.error(`Error sending reminder to ${debtor.name}:`, error);
        failed++;
      }

      setProgress({ sent, failed, total: selectedDebtors.length });
    }

    if (failed === 0) {
      toast({
        title: 'All Reminders Sent',
        description: `Payment reminders sent to ${sent} debtor(s).`,
      });
    } else {
      toast({
        title: 'Reminders Partially Sent',
        description: `Sent: ${sent}, Failed: ${failed}. Check logs for details.`,
        variant: 'destructive',
      });
    }

    setSending(false);
    setSelectedIds(new Set());
    setProgress({ sent: 0, failed: 0, total: 0 });
    onSuccess();
    onOpenChange(false);
  };

  const totalOverdue = debtors
    .filter(d => selectedIds.has(d.id))
    .reduce((sum, d) => sum + (d.total_overdue || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Send Bulk Reminders
          </DialogTitle>
          <DialogDescription>
            Select debtors to send payment reminder emails with overdue invoices attached
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Selected</p>
              <p className="text-lg font-semibold">{selectedIds.size} of {debtors.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-lg font-semibold text-destructive">
                {formatCurrency(totalOverdue)}
              </p>
            </div>
          </div>

          {/* Progress Bar (visible during send) */}
          {sending && progress.total > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Sending reminders...</span>
                <span>{progress.sent + progress.failed} / {progress.total}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${((progress.sent + progress.failed) / progress.total) * 100}%` }}
                />
              </div>
              {progress.failed > 0 && (
                <p className="text-xs text-destructive">{progress.failed} failed</p>
              )}
            </div>
          )}

          {/* Select All */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedIds.size === debtors.length && debtors.length > 0}
              onCheckedChange={selectAll}
              disabled={sending}
            />
            <span className="text-sm font-medium">Select All</span>
          </div>

          {/* Debtor List */}
          <ScrollArea className="h-[300px] border rounded-lg">
            <div className="p-2 space-y-1">
              {debtors.map(debtor => (
                <div
                  key={debtor.id}
                  onClick={() => !sending && toggleSelect(debtor.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                    selectedIds.has(debtor.id) 
                      ? "bg-primary/10 border border-primary/20" 
                      : "hover:bg-muted",
                    sending && "opacity-60 cursor-not-allowed"
                  )}
                >
                  <Checkbox
                    checked={selectedIds.has(debtor.id)}
                    onCheckedChange={() => !sending && toggleSelect(debtor.id)}
                    disabled={sending}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{debtor.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{debtor.email}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-destructive">
                      {formatCurrency(debtor.total_overdue || 0)}
                    </p>
                    <div className="flex items-center gap-1 justify-end">
                      <p className="text-xs text-muted-foreground">
                        {debtor.days_overdue || 0}d overdue
                      </p>
                      {(debtor.overdue_invoices?.length || 0) > 0 && (
                        <Badge variant="outline" className="text-[10px] h-4 px-1">
                          {debtor.overdue_invoices?.length} inv
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={sending || selectedIds.size === 0}>
              {sending ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Sending ({progress.sent}/{progress.total})...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Reminders ({selectedIds.size})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkReminderModal;
