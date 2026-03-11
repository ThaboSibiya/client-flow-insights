import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Phone } from 'lucide-react';
import EmailProvidersSection from './communications/EmailProvidersSection';
import SmsProvidersSection from './communications/SmsProvidersSection';

const CommunicationSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Communication Channels</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Connect your email and SMS provider accounts to power customer outreach, automations and notifications.
        </p>
      </div>

      {/* POPIA / compliance tip */}
      <div className="flex gap-3 rounded-lg border border-border bg-muted/40 p-4">
        <span className="text-lg leading-none">🇿🇦</span>
        <div className="text-sm text-muted-foreground">
          <strong className="text-foreground">Compliance Tip:</strong> Ensure your email
          footers include a physical address, unsubscribe link, and comply with POPIA data
          handling requirements for South African customers.
        </div>
      </div>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Providers
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            SMS Providers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="mt-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Email Service Provider</CardTitle>
              <CardDescription>
                Select a provider, enter your account credentials, and configure sender details.
                Your provider account handles the actual email delivery.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailProvidersSection />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms" className="mt-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">SMS Gateway</CardTitle>
              <CardDescription>
                Connect your SMS provider to send messages from your automations and pipeline
                workflows. You need your own account with the provider.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SmsProvidersSection />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationSettings;
