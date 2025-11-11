import { useCustomerFinance } from '@/hooks/useCustomerFinance';
import { useFinanceBackend } from '@/hooks/useFinanceBackend';
import { useFinanceEvents } from '@/hooks/useFinanceEvents';
import AccountSnapshot from './AccountSnapshot';
import DebtorNotesPanel from './DebtorNotesPanel';
import TransactionLedger from './TransactionLedger';
import InvoicesTable from './InvoicesTable';
import AccountFlagsPanel from './AccountFlagsPanel';
import ActionCenter from './ActionCenter';
import ReminderHistoryPanel from './ReminderHistoryPanel';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CustomerFinanceTabProps {
  customerId: string;
  customerName: string;
}

const CustomerFinanceTab = ({ customerId, customerName }: CustomerFinanceTabProps) => {
  const {
    financeSummary,
    debtorNotes,
    transactions,
    loading: legacyLoading,
    addDebtorNote,
    addTransaction,
    refreshData: refreshLegacyData
  } = useCustomerFinance(customerId);

  const {
    invoices,
    payments,
    accountFlags,
    loading: backendLoading,
    createPayment,
    updateInvoiceStatus,
    resolveAccountFlag,
    refreshData: refreshBackendData
  } = useFinanceBackend(customerId);

  const loading = legacyLoading || backendLoading;

  const refreshAllData = () => {
    refreshLegacyData();
    refreshBackendData();
  };

  // Listen for finance events and auto-refresh
  useFinanceEvents({
    onReminderSent: (data) => {
      if (data?.customerId === customerId) {
        console.log('Reminder sent for this customer - refreshing data');
        refreshAllData();
      }
    },
    onCustomerRefresh: (refreshCustomerId) => {
      if (refreshCustomerId === customerId) {
        console.log('Customer-specific refresh triggered');
        refreshAllData();
      }
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-quikle-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-0">
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
            R{financeSummary?.current_balance.toFixed(2) || '0.00'}
          </p>
          <p className={`text-xs font-medium ${
            financeSummary?.account_status === 'active' ? 'text-green-600' : 'text-red-600'
          }`}>
            {financeSummary?.account_status || 'Unknown'}
          </p>
        </div>
      </div>

      {/* Account Flags */}
      <AccountFlagsPanel flags={accountFlags} onResolve={resolveAccountFlag} />

      {/* Account Snapshot */}
      <AccountSnapshot summary={financeSummary} />

      {/* Tabs for different finance sections */}
      <Tabs defaultValue="overview" className="w-full min-h-0">
        <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
          <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6 min-h-0">
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
            <div className="lg:col-span-2 space-y-6">
              {/* Debtor Notes */}
              <DebtorNotesPanel notes={debtorNotes} onAddNote={addDebtorNote} />

              {/* Transaction Ledger */}
              <TransactionLedger transactions={transactions} />
              
              {/* Reminder History */}
              <ReminderHistoryPanel customerId={customerId} />
            </div>

        {/* Action Center Sidebar */}
        <div className="lg:col-span-1">
          <ActionCenter customerId={customerId} onAddTransaction={addTransaction} onRefresh={refreshAllData} />
        </div>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="mt-6 min-h-0">
          <InvoicesTable invoices={invoices} onUpdateStatus={updateInvoiceStatus} />
        </TabsContent>

        <TabsContent value="payments" className="mt-6 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TransactionLedger transactions={transactions} />
            </div>
            <div className="lg:col-span-1">
              <ActionCenter customerId={customerId} onAddTransaction={addTransaction} onRefresh={refreshAllData} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerFinanceTab;

