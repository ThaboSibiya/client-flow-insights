import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, AlertTriangle, FileText } from 'lucide-react';
import { DebtorCustomer } from '@/hooks/useDebtorData';
import DebtorNotesPanel from '@/components/finance/DebtorNotesPanel';
import ReminderHistoryPanel from '@/components/finance/ReminderHistoryPanel';
import ReminderWorkflow from '@/components/finance/reminders/ReminderWorkflow';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { DebtorNote } from '@/types/finance';

interface DebtorDetailPanelProps {
  debtor: DebtorCustomer;
  onRefresh: () => void;
}

const DebtorDetailPanel = ({ debtor, onRefresh }: DebtorDetailPanelProps) => {
  const { toast } = useToast();
  const [notesPage, setNotesPage] = useState(1);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  // Fetch debtor notes with proper typing
  const { data: rawNotes, refetch: refetchNotes } = useQuery({
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

  const notes = (rawNotes || []) as DebtorNote[];

  // Fetch account flags
  const { data: flags = [] } = useQuery({
    queryKey: ['account-flags', debtor.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('account_flags')
        .select('*')
        .eq('customer_id', debtor.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleAddNote = async (noteData: any) => {
    try {
      const { error } = await supabase.from('debtor_notes').insert({
        customer_id: debtor.id,
        ...noteData,
      });

      if (error) throw error;

      toast({
        title: 'Note Added',
        description: 'Debtor note has been added successfully.',
      });

      refetchNotes();
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: 'Error',
        description: 'Failed to add note. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Customer Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{debtor.name}</h2>
              {debtor.finance_summary && (
                <Badge className={`mt-2 ${
                  debtor.finance_summary.risk_rating === 'critical' ? 'bg-red-100 text-red-800' :
                  debtor.finance_summary.risk_rating === 'high' ? 'bg-orange-100 text-orange-800' :
                  debtor.finance_summary.risk_rating === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {debtor.finance_summary.risk_rating.toUpperCase()} RISK
                </Badge>
              )}
            </div>
            <Button onClick={onRefresh} variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Send Reminder
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{debtor.email}</span>
              </div>
              {debtor.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{debtor.phone}</span>
                </div>
              )}
              {debtor.company_address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{debtor.company_address}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Overdue:</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(debtor.total_overdue || 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Days Overdue:</span>
                <span className="font-semibold text-foreground">
                  {debtor.days_overdue || 0} days
                </span>
              </div>
              {debtor.finance_summary && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Credit Limit:</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(debtor.finance_summary.credit_limit)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Account Status:</span>
                    <Badge variant="outline">
                      {debtor.finance_summary.account_status}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Flags */}
      {flags.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Active Account Flags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {flags.map((flag: any) => (
                <div key={flag.id} className="text-sm p-2 bg-background rounded border">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-semibold">{flag.flag_type.replace('_', ' ').toUpperCase()}</span>
                      <p className="text-muted-foreground text-xs mt-1">{flag.flag_reason}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {flag.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Collection Workflow */}
      {debtor.days_overdue && debtor.days_overdue > 0 && (
        <ReminderWorkflow
          customerId={debtor.id}
          daysOverdue={debtor.days_overdue}
          onSendReminder={(type) => {
            toast({
              title: 'Reminder Sent',
              description: `${type.replace('_', ' ')} reminder has been sent.`,
            });
            onRefresh();
          }}
        />
      )}

      {/* Tabs for detailed information */}
      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invoices">
            Overdue Invoices ({debtor.overdue_invoices?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="notes">Notes ({notes.length})</TabsTrigger>
          <TabsTrigger value="reminders">Reminder History</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                {debtor.overdue_invoices && debtor.overdue_invoices.length > 0 ? (
                  debtor.overdue_invoices.map((invoice: any) => (
                    <div key={invoice.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
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
                          <p className="font-semibold text-red-600">
                            {formatCurrency(invoice.total_amount)}
                          </p>
                          <Badge variant="destructive" className="text-xs mt-1">
                            {invoice.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No overdue invoices
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <DebtorNotesPanel
            notes={notes}
            onAddNote={handleAddNote}
            hasMore={notes.length >= notesPage * 10}
            onLoadMore={() => setNotesPage(p => p + 1)}
            loadingMore={false}
          />
        </TabsContent>

        <TabsContent value="reminders" className="mt-4">
          <ReminderHistoryPanel customerId={debtor.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DebtorDetailPanel;
