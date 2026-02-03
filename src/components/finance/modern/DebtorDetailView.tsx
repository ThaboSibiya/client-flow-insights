import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mail, 
  Phone, 
  MapPin, 
  FileText,
  MessageSquare,
  Clock,
  Send,
  Plus,
  ExternalLink,
  Copy
} from 'lucide-react';
import { DebtorCustomer } from '@/hooks/useDebtorData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import CollectionTimeline from './CollectionTimeline';
import DebtorNotesPanel from '@/components/finance/DebtorNotesPanel';
import ReminderHistoryPanel from '@/components/finance/ReminderHistoryPanel';
import { DebtorNote } from '@/types/finance';

interface DebtorDetailViewProps {
  debtor: DebtorCustomer;
  onRefresh: () => void;
  onSendReminder: () => void;
}

type ActiveSection = 'overview' | 'invoices' | 'notes' | 'history';

const DebtorDetailView = ({ debtor, onRefresh, onSendReminder }: DebtorDetailViewProps) => {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [notesPage, setNotesPage] = useState(1);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  // Fetch debtor notes
  const { data: rawNotes = [], refetch: refetchNotes } = useQuery({
    queryKey: ['debtor-notes', debtor.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debtor_notes')
        .select('*')
        .eq('customer_id', debtor.id)
        .order('created_at', { ascending: false })
        .range(0, notesPage * 10 - 1);
      if (error) throw error;
      return data || [];
    },
  });

  const notes = rawNotes as DebtorNote[];

  const handleAddNote = async (noteData: any) => {
    try {
      const { error } = await supabase.from('debtor_notes').insert({
        customer_id: debtor.id,
        ...noteData,
      });
      if (error) throw error;
      toast({ title: 'Note Added', description: 'Debtor note saved successfully.' });
      refetchNotes();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add note.', variant: 'destructive' });
    }
  };

  const handleSendReminder = (type: string) => {
    toast({
      title: 'Reminder Sent',
      description: `${type.replace('_', ' ')} reminder has been sent.`,
    });
    onRefresh();
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied', description: `${label} copied to clipboard` });
  };

  const risk = debtor.finance_summary?.risk_rating || 'low';
  const daysOverdue = debtor.days_overdue || 0;

  const sectionTabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'invoices', label: `Invoices (${debtor.overdue_invoices?.length || 0})`, icon: FileText },
    { id: 'notes', label: `Notes (${notes.length})`, icon: MessageSquare },
    { id: 'history', label: 'History', icon: Clock },
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header Card */}
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold truncate">{debtor.name}</h2>
              <Badge className={cn(
                "text-xs",
                risk === 'critical' && "bg-destructive text-destructive-foreground",
                risk === 'high' && "bg-orange-500 text-white",
                risk === 'medium' && "bg-yellow-500 text-white",
                risk === 'low' && "bg-green-500 text-white"
              )}>
                {risk.toUpperCase()} RISK
              </Badge>
              {debtor.finance_summary?.account_status && (
                <Badge variant="outline" className="text-xs">
                  {debtor.finance_summary.account_status}
                </Badge>
              )}
            </div>

            {/* Contact Info Row */}
            <div className="flex items-center gap-4 mt-2 flex-wrap text-sm text-muted-foreground">
              <button 
                onClick={() => copyToClipboard(debtor.email, 'Email')}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                <span className="truncate">{debtor.email}</span>
                <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100" />
              </button>
              {debtor.phone && (
                <button 
                  onClick={() => copyToClipboard(debtor.phone!, 'Phone')}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>{debtor.phone}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button size="sm" variant="outline" onClick={onSendReminder}>
              <Send className="h-4 w-4 mr-2" />
              Remind
            </Button>
            <Button size="sm" variant="outline" onClick={() => setActiveSection('notes')}>
              <Plus className="h-4 w-4 mr-2" />
              Note
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-destructive/10 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Total Overdue</p>
            <p className="text-lg font-bold text-destructive">
              {formatCurrency(debtor.total_overdue || 0)}
            </p>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Days Overdue</p>
            <p className="text-lg font-bold">{daysOverdue} days</p>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Credit Limit</p>
            <p className="text-lg font-bold">
              {formatCurrency(debtor.finance_summary?.credit_limit || 0)}
            </p>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Overdue Invoices</p>
            <p className="text-lg font-bold">{debtor.overdue_invoices?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Section Navigation Pills */}
      <div className="px-4 py-2 border-b flex-shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1">
          {sectionTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as ActiveSection)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                  activeSection === tab.id 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {activeSection === 'overview' && (
            <div className="space-y-4">
              {/* Collection Timeline */}
              {daysOverdue > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold mb-3">Collection Workflow</h3>
                    <CollectionTimeline 
                      daysOverdue={daysOverdue} 
                      onSendReminder={handleSendReminder}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Recent Activity Summary */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold mb-3">Quick Summary</h3>
                  <div className="space-y-2 text-sm">
                    {debtor.finance_summary?.last_payment_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Last Payment</span>
                        <span>{format(new Date(debtor.finance_summary.last_payment_date), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                    {debtor.finance_summary?.next_due_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Next Due Date</span>
                        <span>{format(new Date(debtor.finance_summary.next_due_date), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Credit Limit</span>
                      <span>{formatCurrency(debtor.finance_summary?.credit_limit || 0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'invoices' && (
            <div className="space-y-2">
              {debtor.overdue_invoices && debtor.overdue_invoices.length > 0 ? (
                debtor.overdue_invoices.map((invoice: any) => (
                  <Card key={invoice.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold">{invoice.invoice_number}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Due: {format(new Date(invoice.due_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-destructive">
                            {formatCurrency(invoice.total_amount)}
                          </p>
                          <Badge variant="destructive" className="text-xs mt-1">
                            {invoice.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No overdue invoices
                </div>
              )}
            </div>
          )}

          {activeSection === 'notes' && (
            <DebtorNotesPanel
              notes={notes}
              onAddNote={handleAddNote}
              hasMore={notes.length >= notesPage * 10}
              onLoadMore={() => setNotesPage(p => p + 1)}
              loadingMore={false}
            />
          )}

          {activeSection === 'history' && (
            <ReminderHistoryPanel customerId={debtor.id} />
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default DebtorDetailView;
