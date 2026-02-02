import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Webhook, ExternalLink, Zap, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useWebhookConnections } from '@/hooks/useWebhookConnections';
import { useApiTriggers } from '@/hooks/useApiTriggers';
import { useDataSyncRules } from '@/hooks/useDataSyncRules';

const WebhookSettings = () => {
  const { connections } = useWebhookConnections();
  const { triggers } = useApiTriggers();
  const { syncRules } = useDataSyncRules();

  const activeWebhooks = connections.filter(c => c.is_active).length;
  const activeTriggers = triggers.filter(t => t.is_active).length;
  const activeSyncRules = syncRules.filter(r => r.is_active).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-primary" />
            Integration Overview
          </CardTitle>
          <CardDescription>
            Quick overview of your connected integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/30">
                <Zap className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeWebhooks}</div>
                <div className="text-xs text-muted-foreground">Webhook Connections</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/30">
                <Webhook className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeTriggers}</div>
                <div className="text-xs text-muted-foreground">API Triggers</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30">
                <GitBranch className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeSyncRules}</div>
                <div className="text-xs text-muted-foreground">Sync Rules</div>
              </div>
            </div>
          </div>

          {/* Recent Connections */}
          {connections.length > 0 && (
            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-medium text-muted-foreground">Recent Connections</h4>
              <div className="space-y-2">
                {connections.slice(0, 3).map(conn => (
                  <div key={conn.id} className="flex items-center justify-between p-2 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Badge variant={conn.is_active ? 'default' : 'secondary'} className="text-xs">
                        {conn.platform}
                      </Badge>
                      <span className="text-sm font-medium">{conn.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {conn.trigger_count} triggers
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Full Integration Management</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Manage all webhooks, API triggers, and sync rules
              </p>
            </div>
            <Button variant="default" asChild>
              <Link to="/integrations" className="flex items-center gap-2">
                Open Integrations Hub
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebhookSettings;
