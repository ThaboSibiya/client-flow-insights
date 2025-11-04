import { useParams } from 'react-router-dom';
import { useCustomerFinance } from '@/hooks/useCustomerFinance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AccountSnapshot from '@/components/finance/AccountSnapshot';
import DebtorNotesPanel from '@/components/finance/DebtorNotesPanel';
import TransactionLedger from '@/components/finance/TransactionLedger';
import ActionCenter from '@/components/finance/ActionCenter';
import { Loader2 } from 'lucide-react';

const CustomerFinance = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const {
    financeSummary,
    debtorNotes,
    transactions,
    loading,
    addDebtorNote,
    addTransaction,
    refreshData
  } = useCustomerFinance(customerId || '');

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer Finance</h1>
          <p className="text-muted-foreground">
            Account: {financeSummary?.account_number || 'Loading...'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Current Balance</p>
          <p className="text-2xl font-bold">
            R{financeSummary?.current_balance.toFixed(2) || '0.00'}
          </p>
          <p className={`text-sm font-medium ${
            financeSummary?.account_status === 'active' ? 'text-green-600' : 'text-red-600'
          }`}>
            Status: {financeSummary?.account_status || 'Unknown'}
          </p>
        </div>
      </div>

      {/* Account Snapshot */}
      <AccountSnapshot summary={financeSummary} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Debtor Notes */}
          <DebtorNotesPanel notes={debtorNotes} onAddNote={addDebtorNote} />

          {/* Transaction Ledger */}
          <TransactionLedger transactions={transactions} />
        </div>

        {/* Action Center Sidebar */}
        <div className="lg:col-span-1">
          <ActionCenter customerId={customerId} onAddTransaction={addTransaction} onRefresh={refreshData} />
        </div>
      </div>
    </div>
  );
};

export default CustomerFinance;
