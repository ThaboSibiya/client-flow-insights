
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle, AlertCircle, Send, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ResendSettings = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [settings, setSettings] = useState({
    fromName: '',
    fromEmail: '',
    replyToEmail: '',
    emailSignature: '',
    enabled: false
  });

  useEffect(() => {
    checkConnection();
    loadSettings();
  }, []);

  const checkConnection = async () => {
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: { test: true }
      });
      setIsConnected(!error);
    } catch {
      setIsConnected(false);
    }
  };

  const loadSettings = () => {
    const saved = localStorage.getItem('resendSettings');
    if (saved) setSettings(JSON.parse(saved));
  };

  const saveSettings = () => {
    localStorage.setItem('resendSettings', JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "Resend configuration updated successfully.",
    });
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: "Email Required",
        description: "Please enter a test email address.",
        variant: "destructive"
      });
      return;
    }

    setIsTesting(true);
    try {
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: testEmail,
          subject: 'Resend Integration Test - South African Business',
          message: `
            <h2>Email Integration Test</h2>
            <p>This is a test email from your South African business management system using Resend.</p>
            <p><strong>From:</strong> ${settings.fromName || 'Your Business'}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString('en-ZA')}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">Sent via Resend email service</p>
          `,
          senderName: settings.fromName || 'Your Business'
        }
      });

      if (error) throw error;

      toast({
        title: "Test Email Sent",
        description: `Successfully sent test email to ${testEmail}`,
      });
      setIsConnected(true);
    } catch (error: any) {
      toast({
        title: "Test Failed",
        description: error.message || "Failed to send test email",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Section */}
      <div className="p-4 border rounded-lg bg-blue-50">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium">Resend Status</h4>
          <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
            {isConnected ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            {isConnected ? 'Connected' : 'Not Connected'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Resend offers reliable email delivery with a generous free tier (3,000 emails/month).
        </p>
      </div>

      {/* Configuration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="resend-enabled">Enable Resend</Label>
          <Switch
            id="resend-enabled"
            checked={settings.enabled}
            onCheckedChange={(enabled) => setSettings(prev => ({ ...prev, enabled }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="from-name">Business Name</Label>
            <Input
              id="from-name"
              placeholder="Your Business Name"
              value={settings.fromName}
              onChange={(e) => setSettings(prev => ({ ...prev, fromName: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="from-email">From Email</Label>
            <Input
              id="from-email"
              type="email"
              placeholder="noreply@yourbusiness.co.za"
              value={settings.fromEmail}
              onChange={(e) => setSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">Must be verified in Resend</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reply-to">Reply-To Email</Label>
          <Input
            id="reply-to"
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
            placeholder="Best regards,&#10;Your Business Name&#10;Email: support@yourbusiness.co.za&#10;Phone: +27 11 123 4567"
            value={settings.emailSignature}
            onChange={(e) => setSettings(prev => ({ ...prev, emailSignature: e.target.value }))}
            rows={4}
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
          <Button onClick={sendTestEmail} disabled={isTesting || !testEmail}>
            <Send className="h-4 w-4 mr-2" />
            {isTesting ? 'Sending...' : 'Test'}
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => window.open('https://resend.com/domains', '_blank', 'noopener,noreferrer')}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Verify Domain
        </Button>
        <Button onClick={saveSettings}>Save Settings</Button>
      </div>
    </div>
  );
};

export default ResendSettings;
