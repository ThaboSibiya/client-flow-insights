import { useCustomerFinance } from '@/hooks/useCustomerFinance';
import AccountSnapshot from './AccountSnapshot';
import DebtorNotesPanel from './DebtorNotesPanel';
import TransactionLedger from './TransactionLedger';
import ActionCenter from './ActionCenter';
import { Loader2 } from 'lucide-react';

interface CustomerFinanceTabProps {
  customerId: string;
  customerName: string;
}

const CustomerFinanceTab = ({ customerId, customerName }: CustomerFinanceTabProps) => {
  const {
    financeSummary,
    debtorNotes,
    transactions,
    loading,
    addDebtorNote,
    addTransaction
  } = useCustomerFinance(customerId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-quikle-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">{customerName} - Finance</h3>
          <p className="text-sm text-muted-foreground">
            Account: {financeSummary?.account_number || 'Loading...'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Current Balance</p>
          <p className="text-2xl font-bold">
            ${financeSummary?.current_balance.toFixed(2) || '0.00'}
          </p>
          <p className={`text-xs font-medium ${
            financeSummary?.account_status === 'active' ? 'text-green-600' : 'text-red-600'
          }`}>
            {financeSummary?.account_status || 'Unknown'}
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
          <ActionCenter onAddTransaction={addTransaction} />
        </div>
      </div>
    </div>
  );
};

export default CustomerFinanceTab;
