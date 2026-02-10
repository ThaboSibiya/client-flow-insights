
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Webhook, Zap, Activity, CheckCircle2 } from 'lucide-react';
import { useApiTriggers } from '@/hooks/useApiTriggers';
import { useWebhookConnections } from '@/hooks/useWebhookConnections';
import ApiTriggerCard from './webhook-workflows/ApiTriggerCard';
import WebhookConnectionCard from './webhook-workflows/WebhookConnectionCard';
import CreateApiTriggerSheet from './webhook-workflows/CreateApiTriggerSheet';
import CreateWebhookSheet from './webhook-workflows/CreateWebhookSheet';
import IntegrationsEmptyState from './webhook-workflows/IntegrationsEmptyState';

type FilterType = 'all' | 'api-triggers' | 'webhooks';

const WebhookWorkflowsManager = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [showCreateTrigger, setShowCreateTrigger] = useState(false);
  const [showCreateWebhook, setShowCreateWebhook] = useState(false);

  const {
    triggers,
    isLoading: triggersLoading,
    getWebhookUrl,
    createTrigger,
    toggleTrigger,
    deleteTrigger,
    copyEndpoint,
    testTrigger,
  } = useApiTriggers();

  const {
    connections,
    isLoading: connectionsLoading,
    testWebhook,
    createConnection,
    toggleConnection,
    deleteConnection,
  } = useWebhookConnections();

  const isLoading = triggersLoading || connectionsLoading;
  const totalActive = triggers.filter(t => t.is_active).length + connections.filter(c => c.is_active).length;
  const totalItems = triggers.length + connections.length;

  const filters: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: totalItems },
    { value: 'api-triggers', label: 'API Triggers', count: triggers.length },
    { value: 'webhooks', label: 'Webhooks', count: connections.length },
  ];

  const showTriggers = filter === 'all' || filter === 'api-triggers';
  const showWebhooks = filter === 'all' || filter === 'webhooks';
  const isEmpty = totalItems === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integrations</h2>
          <p className="text-sm text-muted-foreground">
            Connect external apps and automate workflows with API endpoints
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 mr-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Activity className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium text-foreground">{totalActive}</span> active
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium text-foreground">{totalItems}</span> total
            </div>
          </div>
          <Button variant="outline" onClick={() => setShowCreateWebhook(true)}>
            <Zap className="h-4 w-4 mr-2" />
            Add Webhook
          </Button>
          <Button onClick={() => setShowCreateTrigger(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create API Endpoint
          </Button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {f.label}
            <Badge
              variant="secondary"
              className={`h-5 min-w-[20px] px-1.5 text-[10px] ${
                filter === f.value ? 'bg-primary-foreground/20 text-primary-foreground' : ''
              }`}
            >
              {f.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5">
                <div className="h-5 bg-muted rounded w-1/3 mb-3" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isEmpty ? (
        <IntegrationsEmptyState
          onCreateTrigger={() => setShowCreateTrigger(true)}
          onCreateWebhook={() => setShowCreateWebhook(true)}
        />
      ) : (
        <div className="space-y-3">
          {/* API Triggers */}
          {showTriggers && triggers.length > 0 && (
            <>
              {filter === 'all' && triggers.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <Webhook className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    API Endpoints
                  </span>
                </div>
              )}
              {triggers.map((trigger) => (
                <ApiTriggerCard
                  key={trigger.id}
                  trigger={trigger}
                  webhookUrl={getWebhookUrl(trigger.endpoint_key)}
                  onToggle={toggleTrigger}
                  onDelete={deleteTrigger}
                  onTest={testTrigger}
                  onCopy={copyEndpoint}
                />
              ))}
            </>
          )}

          {/* Webhook Connections */}
          {showWebhooks && connections.length > 0 && (
            <>
              {filter === 'all' && connections.length > 0 && (
                <div className="flex items-center gap-2 pt-3">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Webhook Connections
                  </span>
                </div>
              )}
              {connections.map((connection) => (
                <WebhookConnectionCard
                  key={connection.id}
                  connection={connection}
                  onToggle={toggleConnection}
                  onDelete={deleteConnection}
                  onTest={testWebhook}
                />
              ))}
            </>
          )}
        </div>
      )}

      {/* Sheets */}
      <CreateApiTriggerSheet
        open={showCreateTrigger}
        onOpenChange={setShowCreateTrigger}
        onCreateTrigger={createTrigger}
      />
      <CreateWebhookSheet
        open={showCreateWebhook}
        onOpenChange={setShowCreateWebhook}
        onCreateConnection={createConnection}
      />
    </div>
  );
};

export default WebhookWorkflowsManager;
