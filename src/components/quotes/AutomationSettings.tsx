
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Mail, MessageSquare, Clock, Bell } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AutomationSettings = () => {
  const [emailSettings, setEmailSettings] = useState({
    autoSend: false,
    template: 'default',
    subject: 'Your Quote/Invoice from [Company Name]',
    message: `Hi [Customer Name],

Please find your quote/invoice attached.

Thank you for your business!

Best regards,
[Your Name]`
  });

  const [whatsappSettings, setWhatsappSettings] = useState({
    enabled: false,
    template: 'Hi [Customer Name], your quote/invoice is ready. Please check your email for details.'
  });

  const [followUpSettings, setFollowUpSettings] = useState({
    enabled: false,
    firstFollowUp: '3',
    secondFollowUp: '7',
    finalFollowUp: '14',
    reminderTemplate: `Hi [Customer Name],

This is a friendly reminder about your pending quote/invoice.

Please let us know if you have any questions.

Best regards,
[Your Name]`
  });

  const [automationRules, setAutomationRules] = useState({
    autoCreateFromQuote: false,
    sendOnCreate: false,
    markOverdueAfter: '30'
  });

  const handleSaveSettings = () => {
    // Save automation settings
    toast({
      title: "Settings Saved",
      description: "Your automation settings have been saved successfully"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-quikle-charcoal">Automation Settings</h2>
        <Button onClick={handleSaveSettings} className="bg-quikle-primary hover:bg-quikle-secondary text-white">
          Save Settings
        </Button>
      </div>

      {/* Email Automation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-quikle-charcoal">
            <Mail className="h-5 w-5 text-quikle-primary" />
            Email Automation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-quikle-charcoal font-medium">Auto-send emails</Label>
              <p className="text-sm text-quikle-slate">Automatically send quotes/invoices via email when created</p>
            </div>
            <Switch
              checked={emailSettings.autoSend}
              onCheckedChange={(checked) => setEmailSettings(prev => ({ ...prev, autoSend: checked }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailTemplate" className="text-quikle-charcoal">Email Template</Label>
            <Select value={emailSettings.template} onValueChange={(value) => setEmailSettings(prev => ({ ...prev, template: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Template</SelectItem>
                <SelectItem value="professional">Professional Template</SelectItem>
                <SelectItem value="casual">Casual Template</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailSubject" className="text-quikle-charcoal">Email Subject</Label>
            <Input
              id="emailSubject"
              value={emailSettings.subject}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Email subject line..."
              className="border-quikle-silver"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailMessage" className="text-quikle-charcoal">Email Message</Label>
            <Textarea
              id="emailMessage"
              value={emailSettings.message}
              onChange={(e) => setEmailSettings(prev => ({ ...prev, message: e.target.value }))}
              rows={5}
              className="border-quikle-silver"
            />
            <p className="text-xs text-quikle-slate">
              Available variables: [Customer Name], [Company Name], [Your Name], [Quote/Invoice Number]
            </p>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Automation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-quikle-charcoal">
            <MessageSquare className="h-5 w-5 text-green-600" />
            WhatsApp Automation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-quikle-charcoal font-medium">Enable WhatsApp notifications</Label>
              <p className="text-sm text-quikle-slate">Send quote/invoice notifications via WhatsApp</p>
            </div>
            <Switch
              checked={whatsappSettings.enabled}
              onCheckedChange={(checked) => setWhatsappSettings(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsappTemplate" className="text-quikle-charcoal">WhatsApp Message Template</Label>
            <Textarea
              id="whatsappTemplate"
              value={whatsappSettings.template}
              onChange={(e) => setWhatsappSettings(prev => ({ ...prev, template: e.target.value }))}
              rows={3}
              className="border-quikle-silver"
            />
          </div>
        </CardContent>
      </Card>

      {/* Follow-up Automation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-quikle-charcoal">
            <Clock className="h-5 w-5 text-quikle-primary" />
            Follow-up Automation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-quikle-charcoal font-medium">Enable automated follow-ups</Label>
              <p className="text-sm text-quikle-slate">Send reminder emails for unpaid invoices</p>
            </div>
            <Switch
              checked={followUpSettings.enabled}
              onCheckedChange={(checked) => setFollowUpSettings(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstFollowUp" className="text-quikle-charcoal">First Follow-up (days)</Label>
              <Input
                id="firstFollowUp"
                type="number"
                value={followUpSettings.firstFollowUp}
                onChange={(e) => setFollowUpSettings(prev => ({ ...prev, firstFollowUp: e.target.value }))}
                min="1"
                className="border-quikle-silver"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondFollowUp" className="text-quikle-charcoal">Second Follow-up (days)</Label>
              <Input
                id="secondFollowUp"
                type="number"
                value={followUpSettings.secondFollowUp}
                onChange={(e) => setFollowUpSettings(prev => ({ ...prev, secondFollowUp: e.target.value }))}
                min="1"
                className="border-quikle-silver"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="finalFollowUp" className="text-quikle-charcoal">Final Follow-up (days)</Label>
              <Input
                id="finalFollowUp"
                type="number"
                value={followUpSettings.finalFollowUp}
                onChange={(e) => setFollowUpSettings(prev => ({ ...prev, finalFollowUp: e.target.value }))}
                min="1"
                className="border-quikle-silver"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminderTemplate" className="text-quikle-charcoal">Reminder Email Template</Label>
            <Textarea
              id="reminderTemplate"
              value={followUpSettings.reminderTemplate}
              onChange={(e) => setFollowUpSettings(prev => ({ ...prev, reminderTemplate: e.target.value }))}
              rows={5}
              className="border-quikle-silver"
            />
          </div>
        </CardContent>
      </Card>

      {/* General Automation Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-quikle-charcoal">
            <Settings className="h-5 w-5 text-quikle-primary" />
            General Automation Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-quikle-charcoal font-medium">Auto-create invoice from accepted quote</Label>
                <p className="text-sm text-quikle-slate">Automatically generate invoice when quote is accepted</p>
              </div>
              <Switch
                checked={automationRules.autoCreateFromQuote}
                onCheckedChange={(checked) => setAutomationRules(prev => ({ ...prev, autoCreateFromQuote: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-quikle-charcoal font-medium">Send notifications on creation</Label>
                <p className="text-sm text-quikle-slate">Send email/WhatsApp when quote/invoice is created</p>
              </div>
              <Switch
                checked={automationRules.sendOnCreate}
                onCheckedChange={(checked) => setAutomationRules(prev => ({ ...prev, sendOnCreate: checked }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="markOverdue" className="text-quikle-charcoal">Mark invoices as overdue after (days)</Label>
              <Input
                id="markOverdue"
                type="number"
                value={automationRules.markOverdueAfter}
                onChange={(e) => setAutomationRules(prev => ({ ...prev, markOverdueAfter: e.target.value }))}
                min="1"
                className="border-quikle-silver w-32"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationSettings;
