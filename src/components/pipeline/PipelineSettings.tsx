
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TwilioSettings from './settings/TwilioSettings';
import EmailSettings from './settings/EmailSettings';
import { MessageSquare, Mail } from 'lucide-react';
import TelnyxSettings from './settings/TelnyxSettings';

const PipelineSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pipeline Settings</h2>
        <p className="text-muted-foreground">Manage integrations and other pipeline configurations.</p>
      </div>

      <Tabs defaultValue="sms" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
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
              <TabsTrigger value="twilio">Twilio</TabsTrigger>
              <TabsTrigger value="telnyx">Telnyx</TabsTrigger>
            </TabsList>
            <TabsContent value="twilio" className="mt-6">
              <TwilioSettings />
            </TabsContent>
            <TabsContent value="telnyx" className="mt-6">
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

export default PipelineSettings;
