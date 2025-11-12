import { useParams } from 'react-router-dom';
import { useCustomerFinancePaginated } from '@/hooks/useCustomerFinancePaginated';
import { Card, CardContent } from '@/components/ui/card';
import AccountSnapshot from '@/components/finance/AccountSnapshot';
import DebtorNotesPanel from '@/components/finance/DebtorNotesPanel';
import ReminderWorkflow from '@/components/finance/ReminderWorkflow';
import ReminderHistoryPanel from '@/components/finance/ReminderHistoryPanel';
import { Loader2 } from 'lucide-react';

const CustomerFinance = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const {
    financeSummary,
    debtorNotes,
    loading,
    loadingMore,
    hasMoreNotes,
    addDebtorNote,
    loadMoreNotes,
    refreshData
  } = useCustomerFinancePaginated(customerId || '');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!customerId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Customer not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Debtor Management</h1>
            <p className="text-muted-foreground">
              Account: {financeSummary?.account_number || 'Loading...'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Outstanding Balance</p>
            <p className="text-2xl font-bold text-destructive">
              R{financeSummary?.total_owed.toFixed(2) || '0.00'}
            </p>
            <p className={`text-sm font-medium ${
              financeSummary?.risk_rating === 'low' || financeSummary?.risk_rating === 'medium' 
                ? 'text-muted-foreground' 
                : 'text-destructive'
            }`}>
              Risk: {financeSummary?.risk_rating?.toUpperCase() || 'Unknown'}
            </p>
          </div>
        </div>

        {/* Account Snapshot */}
        <AccountSnapshot summary={financeSummary} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Reminder Workflow */}
            {financeSummary && financeSummary.total_owed > 0 && (
              <ReminderWorkflow 
                customerId={customerId}
                currentBalance={financeSummary.total_owed}
                riskRating={financeSummary.risk_rating}
                onReminderSent={refreshData}
              />
            )}

            {/* Debtor Notes */}
            <DebtorNotesPanel 
              notes={debtorNotes} 
              onAddNote={addDebtorNote}
              hasMore={hasMoreNotes}
              onLoadMore={loadMoreNotes}
              loadingMore={loadingMore}
            />
          </div>

          {/* Reminder History Sidebar */}
          <div className="lg:col-span-1">
            <ReminderHistoryPanel customerId={customerId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerFinance;
