import { DebtorCustomer } from '@/hooks/useDebtorData';
import BulkReminderPanel from './BulkReminderPanel';
import ReminderAutomationSettings from './ReminderAutomationSettings';

interface RemindersTabProps {
  debtors: DebtorCustomer[];
  onRefresh: () => void;
}

const RemindersTab = ({ debtors, onRefresh }: RemindersTabProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Send Payment Reminders</h2>
        <p className="text-muted-foreground mt-1">
          Select customers and send bulk payment reminder emails with attached invoices
        </p>
      </div>

      <ReminderAutomationSettings />

      <BulkReminderPanel debtors={debtors} onSuccess={onRefresh} />
    </div>
  );
};

export default RemindersTab;
