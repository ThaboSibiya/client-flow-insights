
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bot, Mail, MessageSquare, Clock, Users, Settings, Save, AlertCircle } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from "@/hooks/use-toast";

interface AutomationSettingsType {
  id?: string;
  user_id: string;
  auto_create_invoice_from_quote: boolean;
  email_auto_send: boolean;
  send_on_create: boolean;
  follow_up_enabled: boolean;
  first_follow_up_days: number;
  second_follow_up_days: number;
  final_follow_up_days: number;
  mark_overdue_after_days: number;
  email_template: string;
  email_subject: string | null;
  email_message: string | null;
  reminder_template: string | null;
  whatsapp_enabled: boolean;
  whatsapp_template: string | null;
}

const AutomationSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AutomationSettingsType>({
    user_id: user?.id || '',
    auto_create_invoice_from_quote: false,
    email_auto_send: false,
    send_on_create: false,
    follow_up_enabled: false,
    first_follow_up_days: 3,
    second_follow_up_days: 7,
    final_follow_up_days: 14,
    mark_overdue_after_days: 30,
    email_template: 'default',
    email_subject: null,
    email_message: null,
    reminder_template: null,
    whatsapp_enabled: false,
    whatsapp_template: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('automation_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching automation settings:', error);
      toast({
        title: "Error",
        description: "Failed to load automation settings",
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
      const { error } = await supabase
        .from('automation_settings')
        .upsert({
          ...settings,
          user_id: user.id,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Automation settings saved successfully"
      });
    } catch (error) {
      console.error('Error saving automation settings:', error);
      toast({
        title: "Error",
        description: "Failed to save automation settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (key: keyof AutomationSettingsType, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return <div className="p-6">Loading automation settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-quikle-charcoal">Automation Settings</h2>
          <p className="text-quikle-slate">Configure automated workflows for quotes and invoices</p>
        </div>
        <Button onClick={saveSettings} disabled={saving} className="bg-quikle-primary hover:bg-quikle-secondary text-white">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <Tabs defaultValue="workflow" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workflow" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Workflow
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="reminders" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Reminders
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quote to Invoice Automation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Auto-create Invoice from Accepted Quote</Label>
                    <p className="text-sm text-quikle-slate">
                      Automatically generate an invoice when a quote is accepted
                    </p>
                  </div>
                  <Switch
                    checked={settings.auto_create_invoice_from_quote}
                    onCheckedChange={(checked) => handleSettingChange('auto_create_invoice_from_quote', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Send Email on Document Creation</Label>
                    <p className="text-sm text-quikle-slate">
                      Automatically send email when quotes or invoices are created
                    </p>
                  </div>
                  <Switch
                    checked={settings.send_on_create}
                    onCheckedChange={(checked) => handleSettingChange('send_on_create', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment & Status Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="overdue-days">Mark as Overdue After (days)</Label>
                    <Input
                      id="overdue-days"
                      type="number"
                      value={settings.mark_overdue_after_days}
                      onChange={(e) => handleSettingChange('mark_overdue_after_days', parseInt(e.target.value))}
                      min="1"
                      max="365"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="email" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Automation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Enable Auto Email Sending</Label>
                    <p className="text-sm text-quikle-slate">
                      Automatically send emails for document updates
                    </p>
                  </div>
                  <Switch
                    checked={settings.email_auto_send}
                    onCheckedChange={(checked) => handleSettingChange('email_auto_send', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-template">Email Template</Label>
                  <Select
                    value={settings.email_template}
                    onValueChange={(value) => handleSettingChange('email_template', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Template</SelectItem>
                      <SelectItem value="professional">Professional Template</SelectItem>
                      <SelectItem value="minimal">Minimal Template</SelectItem>
                      <SelectItem value="custom">Custom Template</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-subject">Default Email Subject</Label>
                  <Input
                    id="email-subject"
                    value={settings.email_subject || ''}
                    onChange={(e) => handleSettingChange('email_subject', e.target.value)}
                    placeholder="Your {type} #{number} from {company}"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-message">Default Email Message</Label>
                  <Textarea
                    id="email-message"
                    value={settings.email_message || ''}
                    onChange={(e) => handleSettingChange('email_message', e.target.value)}
                    placeholder="Dear {customer_name}, please find attached your {type}..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reminders" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Follow-up Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Enable Follow-up Reminders</Label>
                    <p className="text-sm text-quikle-slate">
                      Send automated reminders for unpaid invoices
                    </p>
                  </div>
                  <Switch
                    checked={settings.follow_up_enabled}
                    onCheckedChange={(checked) => handleSettingChange('follow_up_enabled', checked)}
                  />
                </div>

                {settings.follow_up_enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label>First Reminder (days)</Label>
                      <Input
                        type="number"
                        value={settings.first_follow_up_days}
                        onChange={(e) => handleSettingChange('first_follow_up_days', parseInt(e.target.value))}
                        min="1"
                        max="30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Second Reminder (days)</Label>
                      <Input
                        type="number"
                        value={settings.second_follow_up_days}
                        onChange={(e) => handleSettingChange('second_follow_up_days', parseInt(e.target.value))}
                        min="1"
                        max="30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Final Reminder (days)</Label>
                      <Input
                        type="number"
                        value={settings.final_follow_up_days}
                        onChange={(e) => handleSettingChange('final_follow_up_days', parseInt(e.target.value))}
                        min="1"
                        max="60"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reminder-template">Reminder Email Template</Label>
                  <Textarea
                    id="reminder-template"
                    value={settings.reminder_template || ''}
                    onChange={(e) => handleSettingChange('reminder_template', e.target.value)}
                    placeholder="This is a friendly reminder that your invoice #{number} is due..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  WhatsApp Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    WhatsApp integration requires additional setup and API configuration
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Enable WhatsApp Notifications</Label>
                    <p className="text-sm text-quikle-slate">
                      Send notifications via WhatsApp Business API
                    </p>
                  </div>
                  <Switch
                    checked={settings.whatsapp_enabled}
                    onCheckedChange={(checked) => handleSettingChange('whatsapp_enabled', checked)}
                  />
                </div>

                {settings.whatsapp_enabled && (
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-template">WhatsApp Message Template</Label>
                    <Textarea
                      id="whatsapp-template"
                      value={settings.whatsapp_template || ''}
                      onChange={(e) => handleSettingChange('whatsapp_template', e.target.value)}
                      placeholder="Hi {customer_name}, your {type} #{number} is ready..."
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomationSettings;
