
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare } from 'lucide-react';

const TwilioSettings = () => {
  const { toast } = useToast();
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    console.log("Saving Twilio Credentials (simulation):", {
      accountSid,
      authToken: '********', // Never log the real token
      phoneNumber
    });
    
    // In a real implementation, we would call an edge function
    // to securely store these credentials in Supabase Vault.
    setTimeout(() => {
      toast({
        title: "Settings Saved (Simulated)",
        description: "Your Twilio credentials have been logged to the console. Next step is to save them securely.",
      });
      setIsSaving(false);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-red-500" />
          Twilio Configuration
        </CardTitle>
        <CardDescription>
          Connect your Twilio account to send SMS and WhatsApp messages from your automations.
          Don't have an account? <a href="https://www.twilio.com/try-twilio" target="_blank" rel="noopener noreferrer" className="text-primary underline">Sign up here</a>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="accountSid">Account SID</Label>
          <Input 
            id="accountSid"
            value={accountSid}
            onChange={(e) => setAccountSid(e.target.value)}
            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="authToken">Auth Token</Label>
          <Input 
            id="authToken"
            type="password"
            value={authToken}
            onChange={(e) => setAuthToken(e.target.value)}
            placeholder="••••••••••••••••••••••••••••"
          />
           <p className="text-xs text-muted-foreground">Your Auth Token is a secret. We'll store it securely.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Twilio Phone Number</Label>
          <Input 
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+15017122661"
          />
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TwilioSettings;
