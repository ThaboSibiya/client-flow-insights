
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Zap, Clock, Mail } from "lucide-react";
import { useRevenueOptimizationSettings } from '@/hooks/useRevenueOptimizationSettings';

const AutoConversionSettings = () => {
  const { settings, updateSettings, isUpdating } = useRevenueOptimizationSettings();
  const [localSettings, setLocalSettings] = useState({
    auto_create_invoice_from_quote: settings?.auto_create_invoice_from_quote || false,
    mark_overdue_after_days: settings?.mark_overdue_after_days || 30,
    payment_reminder_enabled: settings?.payment_reminder_enabled || true,
    payment_reminder_days: settings?.payment_reminder_days || [3, 7, 14, 30],
    overdue_notification_enabled: settings?.overdue_notification_enabled || true,
    finance_team_email: settings?.finance_team_email || 'finance@company.com',
    upsell_triggers_enabled: settings?.upsell_triggers_enabled || true,
    high_value_threshold: settings?.high_value_threshold || 10000,
    repeat_customer_threshold: settings?.repeat_customer_threshold || 3,
    reminder_template: settings?.reminder_template || '',
  });

  // Update local settings when settings change
  React.useEffect(() => {
    if (settings) {
      setLocalSettings({
        auto_create_invoice_from_quote: settings.auto_create_invoice_from_quote,
        mark_overdue_after_days: settings.mark_overdue_after_days,
        payment_reminder_enabled: settings.payment_reminder_enabled,
        payment_reminder_days: settings.payment_reminder_days,
        overdue_notification_enabled: settings.overdue_notification_enabled,
        finance_team_email: settings.finance_team_email,
        upsell_triggers_enabled: settings.upsell_triggers_enabled,
        high_value_threshold: settings.high_value_threshold,
        repeat_customer_threshold: settings.repeat_customer_threshold,
        reminder_template: settings.reminder_template,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings(localSettings);
  };

  const updateLocalSetting = (key: string, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
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
        {/* Auto-Conversion Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Auto-Conversion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-create Invoices from Accepted Quotes</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically convert accepted quotes to draft invoices
                </p>
              </div>
              <Switch
                checked={localSettings.auto_create_invoice_from_quote}
                onCheckedChange={(checked) => updateLocalSetting('auto_create_invoice_from_quote', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Default Invoice Due Days</Label>
              <Select 
                value={localSettings.mark_overdue_after_days?.toString()} 
                onValueChange={(value) => updateLocalSetting('mark_overdue_after_days', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select due days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="45">45 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Payment Reminders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Payment Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Payment Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Send automated payment reminders before due dates
                </p>
              </div>
              <Switch
                checked={localSettings.payment_reminder_enabled}
                onCheckedChange={(checked) => updateLocalSetting('payment_reminder_enabled', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Reminder Schedule (Days Before Due)</Label>
              <div className="grid grid-cols-4 gap-2">
                {[3, 7, 14, 30].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`day-${day}`}
                      checked={localSettings.payment_reminder_days?.includes(day)}
                      onChange={(e) => {
                        const days = localSettings.payment_reminder_days || [];
                        if (e.target.checked) {
                          updateLocalSetting('payment_reminder_days', [...days, day]);
                        } else {
                          updateLocalSetting('payment_reminder_days', days.filter(d => d !== day));
                        }
                      }}
                      className="rounded"
                    />
                    <Label htmlFor={`day-${day}`} className="text-sm">{day}d</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Reminder Template</Label>
              <Textarea
                value={localSettings.reminder_template || ''}
                onChange={(e) => updateLocalSetting('reminder_template', e.target.value)}
                placeholder="Payment reminder message template..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Overdue Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Overdue Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Finance Team Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Notify finance team about overdue accounts
                </p>
              </div>
              <Switch
                checked={localSettings.overdue_notification_enabled}
                onCheckedChange={(checked) => updateLocalSetting('overdue_notification_enabled', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>Finance Team Email</Label>
              <Input
                value={localSettings.finance_team_email}
                onChange={(e) => updateLocalSetting('finance_team_email', e.target.value)}
                placeholder="finance@company.com"
                type="email"
              />
            </div>
          </CardContent>
        </Card>

        {/* Upselling Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Upselling Triggers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Upselling Triggers</Label>
                <p className="text-sm text-muted-foreground">
                  Identify and suggest upselling opportunities
                </p>
              </div>
              <Switch
                checked={localSettings.upsell_triggers_enabled}
                onCheckedChange={(checked) => updateLocalSetting('upsell_triggers_enabled', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label>High-Value Customer Threshold (R)</Label>
              <Input
                type="number"
                value={localSettings.high_value_threshold || 10000}
                onChange={(e) => updateLocalSetting('high_value_threshold', parseFloat(e.target.value))}
                placeholder="10000"
              />
            </div>

            <div className="space-y-2">
              <Label>Repeat Customer Minimum Orders</Label>
              <Input
                type="number"
                value={localSettings.repeat_customer_threshold || 3}
                onChange={(e) => updateLocalSetting('repeat_customer_threshold', parseInt(e.target.value))}
                placeholder="3"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AutoConversionSettings;
