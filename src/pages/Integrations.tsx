import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Zap, 
  Webhook, 
  GitBranch, 
  Plus, 
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// Hooks
import { useWebhookConnections } from '@/hooks/useWebhookConnections';
import { useApiTriggers } from '@/hooks/useApiTriggers';
import { useDataSyncRules } from '@/hooks/useDataSyncRules';

// Components
import IntegrationCard from '@/components/integrations/IntegrationCard';
import IntegrationEmptyState from '@/components/integrations/IntegrationEmptyState';
import CreateWebhookDialog from '@/components/integrations/CreateWebhookDialog';
import IntegrationsGuide from '@/components/pipeline/automation/webhook-workflows/IntegrationsGuide';
import CreateApiTriggerDialog from '@/components/integrations/CreateApiTriggerDialog';
import CreateSyncRuleDialog from '@/components/integrations/CreateSyncRuleDialog';

const platformIcons: Record<string, string> = {
  zapier: '⚡',
  make: '🔄',
  n8n: '🔗',
  custom: '🔧'
};

const Integrations = () => {
  const [activeTab, setActiveTab] = useState('webhooks');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const [showApiTriggerDialog, setShowApiTriggerDialog] = useState(false);
  const [showSyncRuleDialog, setShowSyncRuleDialog] = useState(false);

  // Data hooks
  const { 
    connections, 
    isLoading: webhooksLoading, 
    createConnection, 
    toggleConnection, 
    deleteConnection, 
    testWebhook,
    refetch: refetchWebhooks
  } = useWebhookConnections();

  const {
    triggers,
    isLoading: triggersLoading,
    getWebhookUrl,
    createTrigger,
    toggleTrigger,
    deleteTrigger,
    copyEndpoint,
    testTrigger,
    refetch: refetchTriggers
  } = useApiTriggers();

  const {
    syncRules,
    isLoading: syncLoading,
    createSyncRule,
    toggleSyncRule,
    deleteSyncRule,
    triggerManualSync,
    refetch: refetchSyncRules
  } = useDataSyncRules();

  // Stats
  const activeWebhooks = connections.filter(c => c.is_active).length;
  const activeTriggers = triggers.filter(t => t.is_active).length;
  const activeSyncRules = syncRules.filter(r => r.is_active).length;
  const totalTriggers = connections.reduce((sum, c) => sum + c.trigger_count, 0) + 
                        triggers.reduce((sum, t) => sum + t.trigger_count, 0);

  // Filter function
  const filterBySearch = <T extends { name: string }>(items: T[]): T[] => {
    if (!searchQuery.trim()) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleRefresh = () => {
    refetchWebhooks();
    refetchTriggers();
    refetchSyncRules();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Integrations Hub
          </h1>
          <p className="text-muted-foreground">
            Connect external systems and automate your workflows
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/30">
                <Zap className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeWebhooks}</div>
                <div className="text-xs text-muted-foreground">Webhook Connections</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/30">
                <Webhook className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeTriggers}</div>
                <div className="text-xs text-muted-foreground">API Triggers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30">
                <GitBranch className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeSyncRules}</div>
                <div className="text-xs text-muted-foreground">Sync Rules</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950/30">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalTriggers.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Triggers</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Start Guide */}
      <IntegrationsGuide />

      {/* Search & Tabs */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Webhooks</span>
            <Badge variant="secondary" className="ml-1">{connections.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="api-triggers" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            <span className="hidden sm:inline">API Triggers</span>
            <Badge variant="secondary" className="ml-1">{triggers.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="sync-rules" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            <span className="hidden sm:inline">Data Sync</span>
            <Badge variant="secondary" className="ml-1">{syncRules.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Webhook Connections</h2>
              <p className="text-sm text-muted-foreground">
                Connect to Zapier, Make, n8n, or custom webhooks
              </p>
            </div>
            <Button onClick={() => setShowWebhookDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Connection
            </Button>
          </div>

          {webhooksLoading ? (
            <IntegrationEmptyState type="webhooks" onCreateFirst={() => {}} isLoading />
          ) : filterBySearch(connections).length === 0 ? (
            <IntegrationEmptyState 
              type="webhooks" 
              onCreateFirst={() => setShowWebhookDialog(true)} 
            />
          ) : (
            <div className="space-y-3">
              {filterBySearch(connections).map((connection) => (
                <IntegrationCard
                  key={connection.id}
                  icon={<span className="text-xl">{platformIcons[connection.platform]}</span>}
                  name={connection.name}
                  description={`Platform: ${connection.platform}`}
                  status={connection.is_active ? 'active' : 'inactive'}
                  isActive={connection.is_active}
                  stats={[
                    { label: 'triggers', value: connection.trigger_count },
                  ]}
                  lastActivity={formatDate(connection.last_triggered_at)}
                  onToggle={() => toggleConnection(connection.id)}
                  onTest={() => testWebhook(connection)}
                  onDelete={() => deleteConnection(connection.id)}
                  copyValue={connection.webhook_url}
                  onCopy={() => {
                    navigator.clipboard.writeText(connection.webhook_url);
                  }}
                >
                  {connection.connected_apps.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {connection.connected_apps.map(app => (
                        <Badge key={app} variant="outline" className="text-xs">
                          {app}
                        </Badge>
                      ))}
                    </div>
                  )}
                </IntegrationCard>
              ))}
            </div>
          )}
        </TabsContent>

        {/* API Triggers Tab */}
        <TabsContent value="api-triggers" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Custom API Triggers</h2>
              <p className="text-sm text-muted-foreground">
                Create webhook endpoints to receive data from external systems
              </p>
            </div>
            <Button onClick={() => setShowApiTriggerDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Trigger
            </Button>
          </div>

          {triggersLoading ? (
            <IntegrationEmptyState type="api-triggers" onCreateFirst={() => {}} isLoading />
          ) : filterBySearch(triggers).length === 0 ? (
            <IntegrationEmptyState 
              type="api-triggers" 
              onCreateFirst={() => setShowApiTriggerDialog(true)} 
            />
          ) : (
            <div className="space-y-3">
              {filterBySearch(triggers).map((trigger) => (
                <IntegrationCard
                  key={trigger.id}
                  icon={<Webhook className="h-5 w-5 text-purple-600" />}
                  name={trigger.name}
                  description={trigger.description || `${trigger.method} endpoint`}
                  status={trigger.is_active ? 'active' : 'inactive'}
                  isActive={trigger.is_active}
                  stats={[
                    { label: 'calls', value: trigger.trigger_count },
                    { label: '', value: trigger.method },
                  ]}
                  lastActivity={formatDate(trigger.last_triggered_at)}
                  onToggle={() => toggleTrigger(trigger.id)}
                  onTest={() => testTrigger(trigger)}
                  onDelete={() => deleteTrigger(trigger.id)}
                  copyValue={getWebhookUrl(trigger.endpoint_key)}
                  onCopy={() => copyEndpoint(trigger.endpoint_key)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{trigger.method}</Badge>
                      <code className="text-xs bg-muted px-2 py-1 rounded flex-1 overflow-hidden text-ellipsis">
                        {getWebhookUrl(trigger.endpoint_key)}
                      </code>
                    </div>
                  </div>
                </IntegrationCard>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Data Sync Tab */}
        <TabsContent value="sync-rules" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Data Synchronization</h2>
              <p className="text-sm text-muted-foreground">
                Keep your systems in sync with automated data flows
              </p>
            </div>
            <Button onClick={() => setShowSyncRuleDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Sync Rule
            </Button>
          </div>

          {syncLoading ? (
            <IntegrationEmptyState type="sync-rules" onCreateFirst={() => {}} isLoading />
          ) : filterBySearch(syncRules).length === 0 ? (
            <IntegrationEmptyState 
              type="sync-rules" 
              onCreateFirst={() => setShowSyncRuleDialog(true)} 
            />
          ) : (
            <div className="space-y-3">
              {filterBySearch(syncRules).map((rule) => (
                <IntegrationCard
                  key={rule.id}
                  icon={<GitBranch className="h-5 w-5 text-blue-600" />}
                  name={rule.name}
                  description={`${rule.source_system} → ${rule.target_system}`}
                  status={rule.status}
                  isActive={rule.is_active}
                  stats={[
                    { label: 'syncs', value: rule.sync_count },
                    { label: '', value: rule.frequency },
                  ]}
                  lastActivity={formatDate(rule.last_sync_at)}
                  onToggle={() => toggleSyncRule(rule.id)}
                  onTest={() => triggerManualSync(rule)}
                  onDelete={() => deleteSyncRule(rule.id)}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">{rule.data_type}</Badge>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{rule.sync_direction}</span>
                  </div>
                </IntegrationCard>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateWebhookDialog
        open={showWebhookDialog}
        onOpenChange={setShowWebhookDialog}
        onCreate={createConnection}
      />
      <CreateApiTriggerDialog
        open={showApiTriggerDialog}
        onOpenChange={setShowApiTriggerDialog}
        onCreate={createTrigger}
      />
      <CreateSyncRuleDialog
        open={showSyncRuleDialog}
        onOpenChange={setShowSyncRuleDialog}
        onCreate={createSyncRule}
      />
    </div>
  );
};

export default Integrations;
