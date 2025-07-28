
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Inbox, Settings } from 'lucide-react';
import EmailIntegrationManager from './EmailIntegrationManager';
import EmailInbox from '@/components/email/EmailInbox';

const EmailIntegrationHub = () => {
  const [activeTab, setActiveTab] = useState('inbox');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500/20 via-purple-500/15 to-pink-500/20 p-6 rounded-xl border border-white/20 backdrop-blur-sm">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Email Integration Hub
        </h2>
        <p className="text-muted-foreground mt-1">
          Manage your email integrations and communicate with customers directly from Quikle
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Email Inbox
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Integration Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox">
          <EmailInbox />
        </TabsContent>

        <TabsContent value="settings">
          <EmailIntegrationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailIntegrationHub;
