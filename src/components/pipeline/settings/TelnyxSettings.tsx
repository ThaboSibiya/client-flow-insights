
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare } from 'lucide-react';

const TelnyxSettings = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    console.log("Saving Telnyx Credentials (simulation):", {
      apiKey: '********', // Never log the real key
      phoneNumber
    });
    
    setTimeout(() => {
      toast({
        title: "Settings Saved (Simulated)",
        description: "Your Telnyx credentials have been logged to the console.",
      });
      setIsSaving(false);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-purple-500" />
          Telnyx Configuration
        </CardTitle>
        <CardDescription>
          Connect your Telnyx account to send SMS messages from your automations.
          Don't have an account? <a href="https://telnyx.com/sign-up" target="_blank" rel="noopener noreferrer" className="text-primary underline">Sign up here</a>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="telnyxApiKey">API Key</Label>
          <Input 
            id="telnyxApiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="KEY0123..._...abc"
          />
           <p className="text-xs text-muted-foreground">Your API Key is a secret. We'll store it securely.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="telnyxPhoneNumber">Telnyx Phone Number</Label>
          <Input 
            id="telnyxPhoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+15551234567"
          />
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TelnyxSettings;
