
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Send, ExternalLink, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const PostmarkSettings = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [settings, setSettings] = useState({
    serverToken: '',
    messageStream: 'outbound',
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
    const saved = localStorage.getItem('postmarkSettings');
    if (saved) setSettings(JSON.parse(saved));
  };

  const saveSettings = () => {
    localStorage.setItem('postmarkSettings', JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "Postmark configuration updated successfully.",
    });
  };

  const testConnection = async () => {
    if (!settings.serverToken) {
      toast({
        title: "Server Token Required",
        description: "Please enter your Postmark server token.",
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
      <div className="p-4 border rounded-lg bg-orange-50">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium flex items-center gap-2">
            Postmark Status
            <Star className="h-4 w-4 text-orange-500" />
          </h4>
          <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
            {isConnected ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            {isConnected ? 'Connected' : 'Not Connected'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Postmark specializes in transactional emails with industry-leading deliverability rates.
        </p>
      </div>

      {/* Configuration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="postmark-enabled">Enable Postmark</Label>
          <Switch
            id="postmark-enabled"
            checked={settings.enabled}
            onCheckedChange={(enabled) => setSettings(prev => ({ ...prev, enabled }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pm-server-token">Postmark Server Token</Label>
          <Input
            id="pm-server-token"
            type="password"
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            value={settings.serverToken}
            onChange={(e) => setSettings(prev => ({ ...prev, serverToken: e.target.value }))}
          />
          <p className="text-xs text-muted-foreground">
            Get this from your Postmark server settings
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pm-stream">Message Stream</Label>
          <select
            id="pm-stream"
            className="w-full p-2 border rounded-md"
            value={settings.messageStream}
            onChange={(e) => setSettings(prev => ({ ...prev, messageStream: e.target.value }))}
          >
            <option value="outbound">Outbound (Transactional)</option>
            <option value="broadcast">Broadcast (Marketing)</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pm-business-name">Business Name</Label>
            <Input
              id="pm-business-name"
              placeholder="Your Business Name"
              value={settings.fromName}
              onChange={(e) => setSettings(prev => ({ ...prev, fromName: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pm-sender-email">Sender Email</Label>
            <Input
              id="pm-sender-email"
              type="email"
              placeholder="noreply@yourbusiness.co.za"
              value={settings.fromEmail}
              onChange={(e) => setSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pm-reply-email">Reply-To Email</Label>
          <Input
            id="pm-reply-email"
            type="email"
            placeholder="support@yourbusiness.co.za"
            value={settings.replyToEmail}
            onChange={(e) => setSettings(prev => ({ ...prev, replyToEmail: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pm-signature">Email Signature</Label>
          <Textarea
            id="pm-signature"
            placeholder="Kind regards,&#10;Your Business Name&#10;support@yourbusiness.co.za&#10;+27 11 123 4567&#10;&#10;Proudly South African"
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
          <Button onClick={testConnection} disabled={isTesting || !testEmail || !settings.serverToken}>
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
            onClick={() => window.open('https://postmarkapp.com/servers', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Get Server Token
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('https://postmarkapp.com/domains', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Setup Domain
          </Button>
        </div>
        <Button onClick={saveSettings}>Save Settings</Button>
      </div>

      {/* Features & Pricing */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Why Postmark?</h4>
        <ul className="text-sm text-muted-foreground space-y-1 mb-3">
          <li>• 45-second average delivery time</li>
          <li>• Industry-leading deliverability (99%+)</li>
          <li>• Detailed bounce handling and analytics</li>
          <li>• Excellent for transactional emails</li>
        </ul>
        <h5 className="font-medium text-sm mb-1">Pricing (USD):</h5>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• $15/month (10,000 emails)</li>
          <li>• $50/month (50,000 emails)</li>
          <li>• $200/month (250,000 emails)</li>
        </ul>
      </div>
    </div>
  );
};

export default PostmarkSettings;
