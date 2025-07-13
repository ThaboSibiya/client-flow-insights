
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Zap, 
  DollarSign, 
  Clock, 
  Mail, 
  AlertCircle, 
  CheckCircle2,
  Save,
  Bot
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from "@/hooks/use-toast";

interface ConversionRule {
  id: string;
  name: string;
  trigger: 'quote_accepted' | 'payment_received' | 'time_based' | 'manual';
  condition: string;
  action: 'create_invoice' | 'send_email' | 'update_status' | 'create_followup';
  enabled: boolean;
}

interface PaymentReminderSettings {
  enabled: boolean;
  reminderDays: number[];
  escalateToFinance: boolean;
  finalNoticeDelay: number;
  emailTemplate: string;
}

const AutoConversionSettings = () => {
  const { user } = useAuth();
  const [conversionRules, setConversionRules] = useState<ConversionRule[]>([]);
  const [paymentReminders, setPaymentReminders] = useState<PaymentReminderSettings>({
    enabled: false,
    reminderDays: [3, 7, 14],
    escalateToFinance: false,
    finalNoticeDelay: 30,
    emailTemplate: 'default'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Load conversion rules from automation_settings or create defaults
      const defaultRules: ConversionRule[] = [
        {
          id: '1',
          name: 'Auto-create Invoice from Accepted Quote',
          trigger: 'quote_accepted',
          condition: 'status = accepted',
          action: 'create_invoice',
          enabled: true
        },
        {
          id: '2',
          name: 'Send Payment Reminder for Overdue Invoices',
          trigger: 'time_based',
          condition: 'due_date < now() AND status = sent',
          action: 'send_email',
          enabled: false
        },
        {
          id: '3',
          name: 'Update Status to Overdue',
          trigger: 'time_based',
          condition: 'due_date + 7 days < now()',
          action: 'update_status',
          enabled: true
        }
      ];
      
      setConversionRules(defaultRules);
    } catch (error) {
      console.error('Error loading conversion settings:', error);
      toast({
        title: "Error",
        description: "Failed to load conversion settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Save to automation_settings table
      const { error } = await supabase
        .from('automation_settings')
        .upsert({
          user_id: user.id,
          auto_create_invoice_from_quote: conversionRules.find(r => r.id === '1')?.enabled || false,
          follow_up_enabled: paymentReminders.enabled,
          first_follow_up_days: paymentReminders.reminderDays[0] || 3,
          second_follow_up_days: paymentReminders.reminderDays[1] || 7,
          final_follow_up_days: paymentReminders.reminderDays[2] || 14,
          mark_overdue_after_days: paymentReminders.finalNoticeDelay,
          email_template: paymentReminders.emailTemplate,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Revenue settings saved successfully"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleRule = (ruleId: string) => {
    setConversionRules(prev => 
      prev.map(rule => 
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const updatePaymentReminders = (field: keyof PaymentReminderSettings, value: any) => {
    setPaymentReminders(prev => ({ ...prev, [field]: value }));
  };

  const getTriggerIcon = (trigger: string) => {
    switch (trigger) {
      case 'quote_accepted': return <CheckCircle2 className="h-4 w-4" />;
      case 'payment_received': return <DollarSign className="h-4 w-4" />;
      case 'time_based': return <Clock className="h-4 w-4" />;
      case 'manual': return <Settings className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create_invoice': return 'bg-green-100 text-green-800';
      case 'send_email': return 'bg-blue-100 text-blue-800';
      case 'update_status': return 'bg-yellow-100 text-yellow-800';
      case 'create_followup': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-6">Loading revenue settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-quikle-charcoal">Revenue Settings</h2>
          <p className="text-quikle-slate">Configure automated revenue optimization rules</p>
        </div>
        <Button onClick={saveSettings} disabled={saving} className="bg-quikle-primary hover:bg-quikle-secondary text-white">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Conversion Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Automated Conversion Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {conversionRules.map((rule) => (
              <div key={rule.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-quikle-crystal">
                      {getTriggerIcon(rule.trigger)}
                    </div>
                    <div>
                      <h4 className="font-medium">{rule.name}</h4>
                      <p className="text-sm text-quikle-slate">{rule.condition}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getActionColor(rule.action)}>
                      {rule.action.replace('_', ' ')}
                    </Badge>
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => toggleRule(rule.id)}
                    />
                  </div>
                </div>
                
                {rule.enabled && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Active Rule</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payment Reminder Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Payment Reminder Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Enable Payment Reminders</Label>
                <p className="text-sm text-quikle-slate">
                  Automatically send reminders for overdue invoices
                </p>
              </div>
              <Switch
                checked={paymentReminders.enabled}
                onCheckedChange={(checked) => updatePaymentReminders('enabled', checked)}
              />
            </div>

            {paymentReminders.enabled && (
              <>
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>First Reminder (days after due)</Label>
                    <Input
                      type="number"
                      value={paymentReminders.reminderDays[0]}
                      onChange={(e) => {
                        const newDays = [...paymentReminders.reminderDays];
                        newDays[0] = parseInt(e.target.value);
                        updatePaymentReminders('reminderDays', newDays);
                      }}
                      min="1"
                      max="30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Second Reminder (days after due)</Label>
                    <Input
                      type="number"
                      value={paymentReminders.reminderDays[1]}
                      onChange={(e) => {
                        const newDays = [...paymentReminders.reminderDays];
                        newDays[1] = parseInt(e.target.value);
                        updatePaymentReminders('reminderDays', newDays);
                      }}
                      min="1"
                      max="60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Final Notice (days after due)</Label>
                    <Input
                      type="number"
                      value={paymentReminders.reminderDays[2]}
                      onChange={(e) => {
                        const newDays = [...paymentReminders.reminderDays];
                        newDays[2] = parseInt(e.target.value);
                        updatePaymentReminders('reminderDays', newDays);
                      }}
                      min="1"
                      max="90"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email Template</Label>
                  <Select
                    value={paymentReminders.emailTemplate}
                    onValueChange={(value) => updatePaymentReminders('emailTemplate', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Reminder</SelectItem>
                      <SelectItem value="friendly">Friendly Reminder</SelectItem>
                      <SelectItem value="formal">Formal Notice</SelectItem>
                      <SelectItem value="urgent">Urgent Notice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Escalate to Finance Team</Label>
                    <p className="text-sm text-quikle-slate">
                      Notify finance team after final notice period
                    </p>
                  </div>
                  <Switch
                    checked={paymentReminders.escalateToFinance}
                    onCheckedChange={(checked) => updatePaymentReminders('escalateToFinance', checked)}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Revenue Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Optimization Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <h4 className="font-medium">Auto-conversion Active</h4>
                </div>
                <p className="text-sm text-quikle-slate">
                  Quotes are automatically converted to invoices when accepted
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <h4 className="font-medium">Payment Optimization</h4>
                </div>
                <p className="text-sm text-quikle-slate">
                  Automated reminders improve payment collection by up to 35%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AutoConversionSettings;
