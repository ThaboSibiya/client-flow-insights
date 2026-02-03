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
    
    // Simulate sending reminders
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: 'Reminders Sent',
      description: `Payment reminders sent to ${selectedIds.size} debtor(s).`,
    });
    
    setSending(false);
    setSelectedIds(new Set());
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
            Select debtors to send payment reminder emails
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

          {/* Select All */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedIds.size === debtors.length && debtors.length > 0}
              onCheckedChange={selectAll}
            />
            <span className="text-sm font-medium">Select All</span>
          </div>

          {/* Debtor List */}
          <ScrollArea className="h-[300px] border rounded-lg">
            <div className="p-2 space-y-1">
              {debtors.map(debtor => (
                <div
                  key={debtor.id}
                  onClick={() => toggleSelect(debtor.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                    selectedIds.has(debtor.id) 
                      ? "bg-primary/10 border border-primary/20" 
                      : "hover:bg-muted"
                  )}
                >
                  <Checkbox
                    checked={selectedIds.has(debtor.id)}
                    onCheckedChange={() => toggleSelect(debtor.id)}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{debtor.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{debtor.email}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-destructive">
                      {formatCurrency(debtor.total_overdue || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {debtor.days_overdue || 0}d overdue
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={sending || selectedIds.size === 0}>
              {sending ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Sending...
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
