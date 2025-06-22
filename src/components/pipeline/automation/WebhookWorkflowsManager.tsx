
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Webhook, Zap, GitBranch, MessageSquare } from 'lucide-react';
import ZapierIntegrations from './webhook-workflows/ZapierIntegrations';
import RealtimeDataSync from './webhook-workflows/RealtimeDataSync';
import CustomApiTriggers from './webhook-workflows/CustomApiTriggers';
import SocialMediaMonitoring from './webhook-workflows/SocialMediaMonitoring';

const WebhookWorkflowsManager = () => {
  const [activeTab, setActiveTab] = useState('zapier');

  const stats = {
    activeWebhooks: 12,
    totalTriggers: 1247,
    successRate: 98.5,
    socialMentions: 45
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Webhook-Based Workflows</h2>
          <p className="text-muted-foreground">
            Connect with 1000+ apps and automate real-time data flows
          </p>
        </div>
        <div className="flex gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.activeWebhooks}</div>
            <div className="text-sm text-muted-foreground">Active Webhooks</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.successRate}%</div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="zapier" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Zapier/Make/N8N
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Real-time Sync
          </TabsTrigger>
          <TabsTrigger value="api-triggers" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Custom API Triggers
          </TabsTrigger>
          <TabsTrigger value="social-monitoring" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Social Monitoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="zapier" className="space-y-6">
          <ZapierIntegrations />
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <RealtimeDataSync />
        </TabsContent>

        <TabsContent value="api-triggers" className="space-y-6">
          <CustomApiTriggers />
        </TabsContent>

        <TabsContent value="social-monitoring" className="space-y-6">
          <SocialMediaMonitoring />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebhookWorkflowsManager;
