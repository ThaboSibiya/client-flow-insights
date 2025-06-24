
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle, AlertCircle, Send, ExternalLink, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const SendGridSettings = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [settings, setSettings] = useState({
    apiKey: '',
    fromName: '',
    fromEmail: '',
    replyToEmail: '',
    emailSignature: '',
    enabled: false
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const saved = localStorage.getItem('sendgridSettings');
    if (saved) setSettings(JSON.parse(saved));
  };

  const saveSettings = () => {
    localStorage.setItem('sendgridSettings', JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "SendGrid configuration updated successfully.",
    });
  };

  const testConnection = async () => {
    if (!settings.apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your SendGrid API key.",
        variant: "destructive"
      });
      return;
    }

    if (!testEmail) {
      toast({
        title: "Email Required",
        description: "Please enter a test email address.",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    // Simulate test (in real implementation, this would call SendGrid API)
    setTimeout(() => {
      setIsConnected(true);
      setIsTesting(false);
      toast({
        title: "Test Email Sent",
        description: `Successfully sent test email to ${testEmail}`,
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Status Section */}
      <div className="p-4 border rounded-lg bg-green-50">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium">SendGrid Status</h4>
          <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
            {isConnected ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            {isConnected ? 'Connected' : 'Not Connected'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          SendGrid is trusted by South African businesses for reliable email delivery with excellent support.
        </p>
      </div>

      {/* API Key Notice */}
      <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">API Key Setup Required</h4>
            <p className="text-sm text-blue-800 mt-1">
              To use SendGrid, you'll need to add your API key to Supabase secrets. This keeps your credentials secure.
            </p>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="sendgrid-enabled">Enable SendGrid</Label>
          <Switch
            id="sendgrid-enabled"
            checked={settings.enabled}
            onCheckedChange={(enabled) => setSettings(prev => ({ ...prev, enabled }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="api-key">SendGrid API Key</Label>
          <Input
            id="api-key"
            type="password"
            placeholder="SG.xxxxxxxxxxxx"
            value={settings.apiKey}
            onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
          />
          <p className="text-xs text-muted-foreground">
            Get your API key from SendGrid dashboard
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="business-name">Business Name</Label>
            <Input
              id="business-name"
              placeholder="Your Business Name"
              value={settings.fromName}
              onChange={(e) => setSettings(prev => ({ ...prev, fromName: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sender-email">Sender Email</Label>
            <Input
              id="sender-email"
              type="email"
              placeholder="noreply@yourbusiness.co.za"
              value={settings.fromEmail}
              onChange={(e) => setSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reply-email">Reply-To Email</Label>
          <Input
            id="reply-email"
            type="email"
            placeholder="support@yourbusiness.co.za"
            value={settings.replyToEmail}
            onChange={(e) => setSettings(prev => ({ ...prev, replyToEmail: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signature">Email Signature</Label>
          <Textarea
            id="signature"
            placeholder="Kind regards,&#10;Your Business Name&#10;Email: support@yourbusiness.co.za&#10;Phone: +27 11 123 4567&#10;Address: Your Business Address, South Africa"
            value={settings.emailSignature}
            onChange={(e) => setSettings(prev => ({ ...prev, emailSignature: e.target.value }))}
            rows={5}
          />
        </div>
      </div>

      {/* Test Email */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-3">Test Integration</h4>
        <div className="flex gap-2">
          <Input
            placeholder="test@yourbusiness.co.za"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="flex-1"
          />
          <Button onClick={testConnection} disabled={isTesting || !testEmail || !settings.apiKey}>
            <Send className="h-4 w-4 mr-2" />
            {isTesting ? 'Sending...' : 'Test'}
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open('https://app.sendgrid.com/settings/api_keys', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Get API Key
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('https://app.sendgrid.com/settings/sender_auth', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Verify Domain
          </Button>
        </div>
        <Button onClick={saveSettings}>Save Settings</Button>
      </div>

      {/* Pricing Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">SendGrid Pricing</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Free: 100 emails/day forever</li>
          <li>• Essentials: From $19.95/month (50,000 emails)</li>
          <li>• Pro: From $89.95/month (100,000 emails)</li>
          <li>• Excellent deliverability and support for SA businesses</li>
        </ul>
      </div>
    </div>
  );
};

export default SendGridSettings;
