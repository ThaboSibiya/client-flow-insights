import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Zap, Webhook, GitBranch, Plus, Search, RefreshCw, ScrollText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Hooks
import { useWebhookConnections } from '@/hooks/useWebhookConnections';
import { useApiTriggers } from '@/hooks/useApiTriggers';
import { useDataSyncRules } from '@/hooks/useDataSyncRules';

// Components
import IntegrationEmptyState from '@/components/integrations/IntegrationEmptyState';
import IntegrationsGuide from '@/components/pipeline/automation/webhook-workflows/IntegrationsGuide';
import CreateApiTriggerSheet from '@/components/pipeline/automation/webhook-workflows/CreateApiTriggerSheet';
import CreateWebhookSheet from '@/components/pipeline/automation/webhook-workflows/CreateWebhookSheet';
import CreateSyncRuleDialog from '@/components/integrations/CreateSyncRuleDialog';
import DeleteConfirmDialog from '@/components/integrations/DeleteConfirmDialog';
import WebhookLogsPanel from '@/components/integrations/WebhookLogsPanel';
import ApiTriggerCard from '@/components/integrations/sections/ApiTriggerCard';
import WebhookCard from '@/components/integrations/sections/WebhookCard';
import SyncRuleCard from '@/components/integrations/sections/SyncRuleCard';

type FilterChip = 'all' | 'api-triggers' | 'webhooks' | 'sync-rules';

const Integrations = () => {
  const [activeFilter, setActiveFilter] = useState<FilterChip>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogs, setShowLogs] = useState(false);

  const [showWebhookSheet, setShowWebhookSheet] = useState(false);
  const [showApiTriggerSheet, setShowApiTriggerSheet] = useState(false);
  const [showSyncRuleDialog, setShowSyncRuleDialog] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: '', description: '', onConfirm: () => {} });

  const {
    connections,
    isLoading: webhooksLoading,
    createConnection,
    toggleConnection,
    deleteConnection,
    testWebhook,
    refetch: refetchWebhooks,
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
    refetch: refetchTriggers,
  } = useApiTriggers();

  const {
    syncRules,
    isLoading: syncLoading,
    createSyncRule,
    toggleSyncRule,
    deleteSyncRule,
    triggerManualSync,
    refetch: refetchSyncRules,
  } = useDataSyncRules();

  const activeWebhooks = connections.filter(c => c.is_active).length;
  const activeTriggers = triggers.filter(t => t.is_active).length;
  const activeSyncRules = syncRules.filter(r => r.is_active).length;
  const totalEvents = connections.reduce((sum, c) => sum + c.trigger_count, 0) +
                      triggers.reduce((sum, t) => sum + t.trigger_count, 0);

  const filterBySearch = <T extends { name: string }>(items: T[]): T[] => {
    if (!searchQuery.trim()) return items;
    return items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const showApiTriggers = activeFilter === 'all' || activeFilter === 'api-triggers';
  const showWebhooks = activeFilter === 'all' || activeFilter === 'webhooks';
  const showSyncRulesSection = activeFilter === 'all' || activeFilter === 'sync-rules';

  const filteredTriggers = filterBySearch(triggers);
  const filteredConnections = filterBySearch(connections);
  const filteredSyncRules = filterBySearch(syncRules);

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

  const handleCreateNew = () => {
    if (activeFilter === 'webhooks') setShowWebhookSheet(true);
    else if (activeFilter === 'sync-rules') setShowSyncRuleDialog(true);
    else setShowApiTriggerSheet(true);
  };

  const confirmDelete = (title: string, description: string, onConfirm: () => void) => {
    setDeleteDialog({ open: true, title, description, onConfirm });
  };

  const filterChips: { key: FilterChip; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: triggers.length + connections.length + syncRules.length },
    { key: 'api-triggers', label: 'API Triggers', count: triggers.length },
    { key: 'webhooks', label: 'Webhooks', count: connections.length },
    { key: 'sync-rules', label: 'Data Sync', count: syncRules.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Integrations Hub</h1>
          <p className="text-muted-foreground text-sm">
            Connect external systems and automate your workflows
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showLogs ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowLogs(!showLogs)}
          >
            <ScrollText className="h-4 w-4 mr-2" />
            Logs
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'API Triggers', value: activeTriggers, dot: 'bg-green-500' },
          { label: 'Webhooks', value: activeWebhooks, dot: 'bg-green-500' },
          { label: 'Sync Rules', value: activeSyncRules, dot: 'bg-green-500' },
          { label: 'Total Events', value: totalEvents.toLocaleString(), dot: 'bg-primary' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn('h-2 w-2 rounded-full', stat.dot)} />
                <div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showLogs && <WebhookLogsPanel />}

      <IntegrationsGuide />

      {/* Filter Chips + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {filterChips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => setActiveFilter(chip.key)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                activeFilter === chip.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {chip.label}
              <span className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] font-semibold min-w-[18px] text-center',
                activeFilter === chip.key
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-background text-foreground'
              )}>
                {chip.count}
              </span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      <div className="space-y-6">
        {showApiTriggers && (
          <div className="space-y-3">
            {activeFilter === 'all' && (
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">API Triggers</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowApiTriggerSheet(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </div>
            )}
            {triggersLoading ? (
              <IntegrationEmptyState type="api-triggers" onCreateFirst={() => {}} isLoading />
            ) : filteredTriggers.length === 0 ? (
              <IntegrationEmptyState type="api-triggers" onCreateFirst={() => setShowApiTriggerSheet(true)} />
            ) : (
              <div className="space-y-2">
                {filteredTriggers.map((trigger) => (
                  <ApiTriggerCard
                    key={trigger.id}
                    trigger={trigger}
                    webhookUrl={getWebhookUrl(trigger.endpoint_key)}
                    onToggle={() => toggleTrigger(trigger.id)}
                    onTest={() => testTrigger(trigger)}
                    onDelete={() => confirmDelete(
                      'Delete API Trigger',
                      `Are you sure you want to delete "${trigger.name}"? This will permanently remove the endpoint and all associated logs. External systems using this URL will stop working.`,
                      () => deleteTrigger(trigger.id)
                    )}
                    onCopy={() => copyEndpoint(trigger.endpoint_key)}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {showWebhooks && (
          <div className="space-y-3">
            {activeFilter === 'all' && (
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Webhooks</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowWebhookSheet(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </div>
            )}
            {webhooksLoading ? (
              <IntegrationEmptyState type="webhooks" onCreateFirst={() => {}} isLoading />
            ) : filteredConnections.length === 0 ? (
              <IntegrationEmptyState type="webhooks" onCreateFirst={() => setShowWebhookSheet(true)} />
            ) : (
              <div className="space-y-2">
                {filteredConnections.map((connection) => (
                  <WebhookCard
                    key={connection.id}
                    connection={connection}
                    onToggle={() => toggleConnection(connection.id)}
                    onTest={() => testWebhook(connection)}
                    onDelete={() => confirmDelete(
                      'Delete Webhook Connection',
                      `Are you sure you want to delete "${connection.name}"? Automations using this webhook will stop working.`,
                      () => deleteConnection(connection.id)
                    )}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {showSyncRulesSection && (
          <div className="space-y-3">
            {activeFilter === 'all' && (
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Data Sync</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowSyncRuleDialog(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </div>
            )}
            {syncLoading ? (
              <IntegrationEmptyState type="sync-rules" onCreateFirst={() => {}} isLoading />
            ) : filteredSyncRules.length === 0 ? (
              <IntegrationEmptyState type="sync-rules" onCreateFirst={() => setShowSyncRuleDialog(true)} />
            ) : (
              <div className="space-y-2">
                {filteredSyncRules.map((rule) => (
                  <SyncRuleCard
                    key={rule.id}
                    rule={rule}
                    onToggle={() => toggleSyncRule(rule.id)}
                    onTest={() => triggerManualSync(rule)}
                    onDelete={() => confirmDelete(
                      'Delete Sync Rule',
                      `Are you sure you want to delete "${rule.name}"? Data synchronization between ${rule.source_system} and ${rule.target_system} will stop.`,
                      () => deleteSyncRule(rule.id)
                    )}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <DeleteConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
        onConfirm={() => {
          deleteDialog.onConfirm();
          setDeleteDialog(prev => ({ ...prev, open: false }));
        }}
        title={deleteDialog.title}
        description={deleteDialog.description}
      />

      <CreateApiTriggerSheet
        open={showApiTriggerSheet}
        onOpenChange={setShowApiTriggerSheet}
        onCreateTrigger={createTrigger}
      />
      <CreateWebhookSheet
        open={showWebhookSheet}
        onOpenChange={setShowWebhookSheet}
        onCreateConnection={createConnection}
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
