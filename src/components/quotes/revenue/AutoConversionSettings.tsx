
import React from 'react';
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useRevenueOptimizationSettings } from '@/hooks/useRevenueOptimizationSettings';
import AutoConversionCard from './settings/AutoConversionCard';
import PaymentRemindersCard from './settings/PaymentRemindersCard';
import OverdueNotificationsCard from './settings/OverdueNotificationsCard';
import UpsellTriggersCard from './settings/UpsellTriggersCard';

const AutoConversionSettings = () => {
  const { settings, updateSettings, isUpdating } = useRevenueOptimizationSettings();

  if (!settings) return null;

  const handleSave = async () => {
    // Settings are saved automatically when changed
    // This could trigger a manual save if needed
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Revenue Optimization Settings</h2>
        <Button onClick={handleSave} disabled={isUpdating}>
          <Settings className="h-4 w-4 mr-2" />
          {isUpdating ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AutoConversionCard
          autoCreateInvoice={settings.auto_create_invoice_from_quote}
          dueDays={settings.mark_overdue_after_days}
          onToggleAutoCreate={(checked: boolean) => updateSettings({ auto_create_invoice_from_quote: checked })}
          onChangeDueDays={(days: number) => updateSettings({ mark_overdue_after_days: days })}
        />

        <PaymentRemindersCard
          enabled={settings.payment_reminder_enabled}
          reminderDays={settings.payment_reminder_days}
          template={settings.reminder_template}
          onToggleEnabled={(checked: boolean) => updateSettings({ payment_reminder_enabled: checked })}
          onChangeReminderDays={(days: number[]) => updateSettings({ payment_reminder_days: days })}
          onChangeTemplate={(template: string) => updateSettings({ reminder_template: template })}
        />

        <OverdueNotificationsCard
          enabled={settings.overdue_notification_enabled}
          financeEmail={settings.finance_team_email}
          onToggleEnabled={(checked: boolean) => updateSettings({ overdue_notification_enabled: checked })}
          onChangeFinanceEmail={(email: string) => updateSettings({ finance_team_email: email })}
        />

        <UpsellTriggersCard
          enabled={settings.upsell_triggers_enabled}
          highValueThreshold={settings.high_value_threshold}
          repeatCustomerThreshold={settings.repeat_customer_threshold}
          onToggleEnabled={(checked: boolean) => updateSettings({ upsell_triggers_enabled: checked })}
          onChangeHighValueThreshold={(threshold: number) => updateSettings({ high_value_threshold: threshold })}
          onChangeRepeatCustomerThreshold={(threshold: number) => updateSettings({ repeat_customer_threshold: threshold })}
        />
      </div>
    </div>
  );
};

export default AutoConversionSettings;
