
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  Zap,
  Settings,
  Bell,
  Calendar
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AutomationSettings = () => {
  const [settings, setSettings] = useState({
    emailAutoSend: false,
    followUpEnabled: true,
    whatsappEnabled: false,
    autoCreateInvoice: false,
    sendOnCreate: false,
    firstFollowUpDays: 3,
    secondFollowUpDays: 7,
    finalFollowUpDays: 14,
    markOverdueDays: 30,
    emailTemplate: 'professional',
    emailSubject: 'Your Quote/Invoice from {{company}}',
    emailMessage: 'Thank you for your interest. Please find your {{type}} attached.'
  });

  const handleToggle = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleInputChange = (key: string, value: string | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your automation settings have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Email Automation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Automation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="email-auto-send">Auto-send emails</Label>
              <p className="text-sm text-quikle-slate">Automatically send quotes/invoices via email</p>
            </div>
            <Switch
              id="email-auto-send"
              checked={settings.emailAutoSend}
              onCheckedChange={(checked) => handleToggle('emailAutoSend', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="send-on-create">Send immediately on creation</Label>
              <p className="text-sm text-quikle-slate">Send document as soon as it's created</p>
            </div>
            <Switch
              id="send-on-create"
              checked={settings.sendOnCreate}
              onCheckedChange={(checked) => handleToggle('sendOnCreate', checked)}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email-template">Email Template</Label>
              <Select value={settings.emailTemplate} onValueChange={(value) => handleInputChange('emailTemplate', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="email-subject">Email Subject</Label>
              <Input
                id="email-subject"
                value={settings.emailSubject}
                onChange={(e) => handleInputChange('emailSubject', e.target.value)}
                placeholder="Email subject line"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email-message">Email Message</Label>
            <Textarea
              id="email-message"
              value={settings.emailMessage}
              onChange={(e) => handleInputChange('emailMessage', e.target.value)}
              placeholder="Email message body"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Follow-up Automation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Follow-up Automation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="follow-up-enabled">Enable automatic follow-ups</Label>
              <p className="text-sm text-quikle-slate">Send follow-up reminders automatically</p>
            </div>
            <Switch
              id="follow-up-enabled"
              checked={settings.followUpEnabled}
              onCheckedChange={(checked) => handleToggle('followUpEnabled', checked)}
            />
          </div>

          {settings.followUpEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="first-followup">First Follow-up (days)</Label>
                <Input
                  id="first-followup"
                  type="number"
                  value={settings.firstFollowUpDays}
                  onChange={(e) => handleInputChange('firstFollowUpDays', parseInt(e.target.value))}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="second-followup">Second Follow-up (days)</Label>
                <Input
                  id="second-followup"
                  type="number"
                  value={settings.secondFollowUpDays}
                  onChange={(e) => handleInputChange('secondFollowUpDays', parseInt(e.target.value))}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="final-followup">Final Follow-up (days)</Label>
                <Input
                  id="final-followup"
                  type="number"
                  value={settings.finalFollowUpDays}
                  onChange={(e) => handleInputChange('finalFollowUpDays', parseInt(e.target.value))}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="mark-overdue">Mark Overdue (days)</Label>
                <Input
                  id="mark-overdue"
                  type="number"
                  value={settings.markOverdueDays}
                  onChange={(e) => handleInputChange('markOverdueDays', parseInt(e.target.value))}
                  min="1"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            WhatsApp Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="whatsapp-enabled">Enable WhatsApp notifications</Label>
              <p className="text-sm text-quikle-slate">Send quotes/invoices via WhatsApp</p>
            </div>
            <Switch
              id="whatsapp-enabled"
              checked={settings.whatsappEnabled}
              onCheckedChange={(checked) => handleToggle('whatsappEnabled', checked)}
            />
          </div>

          {settings.whatsappEnabled && (
            <div className="p-4 bg-quikle-crystal rounded-lg">
              <p className="text-sm text-quikle-slate">
                WhatsApp integration requires API setup. Contact support for configuration assistance.
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Configure WhatsApp API
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Smart Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Smart Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-create-invoice">Auto-create invoice from accepted quotes</Label>
              <p className="text-sm text-quikle-slate">Automatically convert accepted quotes to invoices</p>
            </div>
            <Switch
              id="auto-create-invoice"
              checked={settings.autoCreateInvoice}
              onCheckedChange={(checked) => handleToggle('autoCreateInvoice', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-quikle-primary hover:bg-quikle-secondary">
          <Settings className="h-4 w-4 mr-2" />
          Save Automation Settings
        </Button>
      </div>
    </div>
  );
};

export default AutomationSettings;
