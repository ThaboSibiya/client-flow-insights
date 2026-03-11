import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Mail, Phone } from 'lucide-react';
import TwilioSettings from '@/components/pipeline/settings/TwilioSettings';
import TelnyxSettings from '@/components/pipeline/settings/TelnyxSettings';
import EmailSettings from '@/components/pipeline/settings/EmailSettings';

const CommunicationSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Communication Channels</h2>
        <p className="text-sm text-muted-foreground">
          Configure SMS providers and email integrations for customer outreach.
        </p>
      </div>

      <Tabs defaultValue="sms" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            SMS Providers
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sms" className="mt-6">
          <Tabs defaultValue="twilio" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="twilio" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Twilio
              </TabsTrigger>
              <TabsTrigger value="telnyx" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Telnyx
              </TabsTrigger>
            </TabsList>
            <TabsContent value="twilio" className="mt-4">
              <TwilioSettings />
            </TabsContent>
            <TabsContent value="telnyx" className="mt-4">
              <TelnyxSettings />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="email" className="mt-6">
          <EmailSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationSettings;
