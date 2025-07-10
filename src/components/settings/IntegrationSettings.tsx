
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Mail, Phone, Database } from 'lucide-react';
import TwilioSettings from '@/components/pipeline/settings/TwilioSettings';
import TelnyxSettings from '@/components/pipeline/settings/TelnyxSettings';
import EmailSettings from '@/components/pipeline/settings/EmailSettings';

const IntegrationSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-quikle-charcoal mb-2">Integration Settings</h3>
        <p className="text-sm text-quikle-slate mb-4">
          Configure third-party services for SMS, email, and other communications.
        </p>
      </div>
      
      <Tabs defaultValue="communications" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="communications" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Communications
          </TabsTrigger>
          <TabsTrigger value="other" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Other Services
          </TabsTrigger>
        </TabsList>

        <TabsContent value="communications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-blue-500" />
                SMS & WhatsApp Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <TwilioSettings />
              <TelnyxSettings />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-green-500" />
                Email Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmailSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="other" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Other Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-quikle-slate">
                Additional integrations will be available here soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationSettings;
