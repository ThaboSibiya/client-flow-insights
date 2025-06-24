
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle, AlertCircle, Send, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const EmailSettings = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [emailSettings, setEmailSettings] = useState({
    fromName: '',
    fromEmail: '',
    replyToEmail: '',
    emailSignature: '',
    enabled: false
  });

  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    checkConnectionStatus();
    loadEmailSettings();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      setIsTestingConnection(true);
      // Test the connection by calling the edge function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          test: true // Just to check if the function is available
        }
      });
      
      if (!error) {
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Connection check failed:', error);
      setIsConnected(false);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const loadEmailSettings = () => {
    // Load settings from localStorage or your preferred storage
    const savedSettings = localStorage.getItem('emailSettings');
    if (savedSettings) {
      setEmailSettings(JSON.parse(savedSettings));
    }
  };

  const saveEmailSettings = () => {
    localStorage.setItem('emailSettings', JSON.stringify(emailSettings));
    toast({
      title: "Settings Saved",
      description: "Email configuration has been updated successfully.",
    });
  };

  const testConnection = async () => {
    if (!testEmail) {
      toast({
        title: "Email Required",
        description: "Please enter a test email address.",
        variant: "destructive"
      });
      return;
    }

    setIsSendingTest(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: testEmail,
          subject: 'Test Email - Resend Integration',
          message: `
            <h2>Email Integration Test</h2>
            <p>This is a test email to verify your Resend integration is working correctly.</p>
            <p><strong>From:</strong> ${emailSettings.fromName || 'Your Company'}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">This email was sent from your broker management system.</p>
          `,
          senderName: emailSettings.fromName || 'Your Company'
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Test Email Sent",
        description: `Test email successfully sent to ${testEmail}`,
      });
      setIsConnected(true);
    } catch (error: any) {
      console.error('Test email failed:', error);
      toast({
        title: "Test Failed",
        description: error.message || "Failed to send test email. Please check your configuration.",
        variant: "destructive"
      });
      setIsConnected(false);
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-500" />
          Email Configuration (Resend)
        </CardTitle>
        <CardDescription>
          Configure your email settings using the Resend API integration.
        </CardDescription>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
            {isConnected ? (
              <>
                <CheckCircle className="h-3 w-3" />
                Connected
              </>
            ) : (
              <>
                <AlertCircle className="h-3 w-3" />
                Not Connected
              </>
            )}
          </Badge>
          {isTestingConnection && (
            <Badge variant="outline">Testing...</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="p-4 border rounded-lg bg-blue-50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Resend API Status</h4>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkConnectionStatus}
              disabled={isTestingConnection}
            >
              <Settings className="h-4 w-4 mr-2" />
              {isTestingConnection ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {isConnected 
              ? "Your Resend API is properly configured and ready to send emails."
              : "Unable to connect to Resend API. Please check your configuration."
            }
          </p>
        </div>

        {/* Email Configuration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-enabled">Enable Email Sending</Label>
            <Switch
              id="email-enabled"
              checked={emailSettings.enabled}
              onCheckedChange={(enabled) => 
                setEmailSettings(prev => ({ ...prev, enabled }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-name">From Name</Label>
              <Input
                id="from-name"
                placeholder="Your Company Name"
                value={emailSettings.fromName}
                onChange={(e) => 
                  setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from-email">From Email</Label>
              <Input
                id="from-email"
                type="email"
                placeholder="noreply@yourdomain.com"
                value={emailSettings.fromEmail}
                onChange={(e) => 
                  setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Must be a verified domain in Resend
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reply-to">Reply-To Email (Optional)</Label>
            <Input
              id="reply-to"
              type="email"
              placeholder="support@yourdomain.com"
              value={emailSettings.replyToEmail}
              onChange={(e) => 
                setEmailSettings(prev => ({ ...prev, replyToEmail: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signature">Email Signature</Label>
            <Textarea
              id="signature"
              placeholder="Best regards,&#10;Your Company Name&#10;Email: support@yourdomain.com&#10;Phone: +27 123 456 789"
              value={emailSettings.emailSignature}
              onChange={(e) => 
                setEmailSettings(prev => ({ ...prev, emailSignature: e.target.value }))
              }
              rows={4}
            />
          </div>
        </div>

        {/* Test Email Section */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Test Email Integration</h4>
          <div className="flex gap-2">
            <Input
              placeholder="Enter test email address"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={testConnection}
              disabled={isSendingTest || !testEmail}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSendingTest ? 'Sending...' : 'Send Test'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Send a test email to verify your Resend integration is working correctly.
          </p>
        </div>

        {/* Save Settings */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={saveEmailSettings}>
            Save Email Settings
          </Button>
        </div>

        {/* Usage Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Integration Information</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Your Resend API key is securely stored in Supabase secrets</li>
            <li>• Emails are sent through the send-email edge function</li>
            <li>• Make sure your sending domain is verified in Resend</li>
            <li>• Free tier includes 3,000 emails per month</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailSettings;
