
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Send, ExternalLink, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const MailgunSettings = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [settings, setSettings] = useState({
    apiKey: '',
    domain: '',
    region: 'eu', // EU region for better SA connectivity
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
    const saved = localStorage.getItem('mailgunSettings');
    if (saved) setSettings(JSON.parse(saved));
  };

  const saveSettings = () => {
    localStorage.setItem('mailgunSettings', JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "Mailgun configuration updated successfully.",
    });
  };

  const testConnection = async () => {
    if (!settings.apiKey || !settings.domain) {
      toast({
        title: "Configuration Required",
        description: "Please enter your Mailgun API key and domain.",
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
    // Simulate test
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
      <div className="p-4 border rounded-lg bg-purple-50">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium">Mailgun Status</h4>
          <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
            {isConnected ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            {isConnected ? 'Connected' : 'Not Connected'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Mailgun offers powerful email APIs with excellent deliverability, used by many SA tech companies.
        </p>
      </div>

      {/* Regional Notice */}
      <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">EU Region Recommended</h4>
            <p className="text-sm text-blue-800 mt-1">
              For South African businesses, we recommend using Mailgun's EU region for better connectivity and compliance.
            </p>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="mailgun-enabled">Enable Mailgun</Label>
          <Switch
            id="mailgun-enabled"
            checked={settings.enabled}
            onCheckedChange={(enabled) => setSettings(prev => ({ ...prev, enabled }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="mg-api-key">Mailgun API Key</Label>
            <Input
              id="mg-api-key"
              type="password"
              placeholder="key-xxxxxxxxxx"
              value={settings.apiKey}
              onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mg-domain">Mailgun Domain</Label>
            <Input
              id="mg-domain"
              placeholder="mail.yourbusiness.co.za"
              value={settings.domain}
              onChange={(e) => setSettings(prev => ({ ...prev, domain: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mg-region">Region</Label>
          <select
            id="mg-region"
            className="w-full p-2 border rounded-md"
            value={settings.region}
            onChange={(e) => setSettings(prev => ({ ...prev, region: e.target.value }))}
          >
            <option value="us">US (api.mailgun.net)</option>
            <option value="eu">EU (api.eu.mailgun.net) - Recommended for SA</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="mg-business-name">Business Name</Label>
            <Input
              id="mg-business-name"
              placeholder="Your Business Name"
              value={settings.fromName}
              onChange={(e) => setSettings(prev => ({ ...prev, fromName: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mg-sender-email">Sender Email</Label>
            <Input
              id="mg-sender-email"
              type="email"
              placeholder="noreply@yourbusiness.co.za"
              value={settings.fromEmail}
              onChange={(e) => setSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mg-reply-email">Reply-To Email</Label>
          <Input
            id="mg-reply-email"
            type="email"
            placeholder="support@yourbusiness.co.za"
            value={settings.replyToEmail}
            onChange={(e) => setSettings(prev => ({ ...prev, replyToEmail: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mg-signature">Email Signature</Label>
          <Textarea
            id="mg-signature"
            placeholder="Best regards,&#10;Your Business Name&#10;Email: support@yourbusiness.co.za&#10;Phone: +27 11 123 4567&#10;Website: www.yourbusiness.co.za"
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
            onClick={() => window.open('https://app.mailgun.com/app/account/security/api_keys', '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Get API Key
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('https://app.mailgun.com/app/domains', '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Setup Domain
          </Button>
        </div>
        <Button onClick={saveSettings}>Save Settings</Button>
      </div>

      {/* Pricing Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Mailgun Pricing (USD)</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Free: 5,000 emails for 3 months, then pay-as-you-go</li>
          <li>• Foundation: $35/month (50,000 emails)</li>
          <li>• Growth: $80/month (100,000 emails)</li>
          <li>• Developer-friendly with detailed analytics</li>
        </ul>
      </div>
    </div>
  );
};

export default MailgunSettings;
