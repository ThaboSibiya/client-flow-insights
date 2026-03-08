import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Zap, 
  Webhook, 
  GitBranch, 
  Plus, 
  Search,
  RefreshCw,
  CheckCircle2,
  Copy,
  Check,
  Play,
  Trash2,
  MoreHorizontal,
  Code,
  ChevronDown,
  ChevronRight,
  ScrollText,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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

type FilterChip = 'all' | 'api-triggers' | 'webhooks' | 'sync-rules';

const platformIcons: Record<string, string> = {
  zapier: '⚡',
  make: '🔄',
  n8n: '🔗',
  custom: '⚙️'
};

const Integrations = () => {
  const [activeFilter, setActiveFilter] = useState<FilterChip>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogs, setShowLogs] = useState(false);
  
  // Sheet/Dialog states
  const [showWebhookSheet, setShowWebhookSheet] = useState(false);
  const [showApiTriggerSheet, setShowApiTriggerSheet] = useState(false);
  const [showSyncRuleDialog, setShowSyncRuleDialog] = useState(false);

  // Delete confirmation state
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: '', description: '', onConfirm: () => {} });

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
  const totalEvents = connections.reduce((sum, c) => sum + c.trigger_count, 0) + 
                      triggers.reduce((sum, t) => sum + t.trigger_count, 0);

  // Filter
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
    if (activeFilter === 'webhooks') {
      setShowWebhookSheet(true);
    } else if (activeFilter === 'sync-rules') {
      setShowSyncRuleDialog(true);
    } else {
      setShowApiTriggerSheet(true);
    }
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
          <h1 className="text-2xl font-bold text-foreground">
            Integrations Hub
          </h1>
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
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <div>
                <div className="text-2xl font-bold text-foreground">{activeTriggers}</div>
                <div className="text-xs text-muted-foreground">API Triggers</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <div>
                <div className="text-2xl font-bold text-foreground">{activeWebhooks}</div>
                <div className="text-xs text-muted-foreground">Webhooks</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <div>
                <div className="text-2xl font-bold text-foreground">{activeSyncRules}</div>
                <div className="text-xs text-muted-foreground">Sync Rules</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <div>
                <div className="text-2xl font-bold text-foreground">{totalEvents.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total Events</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Webhook Logs Panel (toggleable) */}
      {showLogs && <WebhookLogsPanel />}

      {/* Quick Start Guide */}
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

      {/* Flat Card List */}
      <div className="space-y-6">
        {/* API Triggers Section */}
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
              <IntegrationEmptyState 
                type="api-triggers" 
                onCreateFirst={() => setShowApiTriggerSheet(true)} 
              />
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

        {/* Webhooks Section */}
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
              <IntegrationEmptyState 
                type="webhooks" 
                onCreateFirst={() => setShowWebhookSheet(true)} 
              />
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

        {/* Data Sync Section */}
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
              <IntegrationEmptyState 
                type="sync-rules" 
                onCreateFirst={() => setShowSyncRuleDialog(true)} 
              />
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

      {/* Delete Confirmation */}
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

      {/* Sheets (slide-over panels) */}
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

// ── API Trigger Card with instant-copy URL + expandable code snippets ──
interface ApiTriggerCardProps {
  trigger: ReturnType<typeof useApiTriggers>['triggers'][number];
  webhookUrl: string;
  onToggle: () => void;
  onTest: () => void;
  onDelete: () => void;
  onCopy: () => void;
  formatDate: (d: string | null) => string;
}

const ApiTriggerCard: React.FC<ApiTriggerCardProps> = ({
  trigger, webhookUrl, onToggle, onTest, onDelete, onCopy, formatDate
}) => {
  const [copied, setCopied] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success('URL copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const curlSnippet = `curl -X ${trigger.method} "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Jane", "email": "jane@example.com"}'`;

  const jsSnippet = `fetch("${webhookUrl}", {
  method: "${trigger.method}",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Jane",
    email: "jane@example.com"
  })
});`;

  return (
    <Card className="group transition-all hover:shadow-sm">
      <CardContent className="p-4 space-y-3">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              'h-2 w-2 rounded-full shrink-0',
              trigger.is_active ? 'bg-green-500' : 'bg-muted-foreground/30'
            )} />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-foreground truncate">{trigger.name}</h4>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">{trigger.method}</Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span>{trigger.trigger_count} calls</span>
                <span>•</span>
                <span>Last: {formatDate(trigger.last_triggered_at)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={trigger.is_active}
              onCheckedChange={onToggle}
              className="shrink-0"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onTest}>
                  <Play className="h-3.5 w-3.5 mr-2" />
                  Send Test
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* URL row — hero element */}
        <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
          <code className="flex-1 text-xs font-mono text-foreground truncate select-all">
            {webhookUrl}
          </code>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleCopy}>
            {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {/* Expandable code snippets */}
        <Collapsible open={showSnippets} onOpenChange={setShowSnippets}>
          <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Code className="h-3.5 w-3.5" />
            Code Snippets
            {showSnippets ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 space-y-2">
              <SnippetBlock label="cURL" code={curlSnippet} />
              <SnippetBlock label="JavaScript" code={jsSnippet} />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

// ── Webhook Card ──
interface WebhookCardProps {
  connection: ReturnType<typeof useWebhookConnections>['connections'][number];
  onToggle: () => void;
  onTest: () => void;
  onDelete: () => void;
  formatDate: (d: string | null) => string;
}

const WebhookCard: React.FC<WebhookCardProps> = ({
  connection, onToggle, onTest, onDelete, formatDate
}) => {
  const [copied, setCopied] = useState(false);
  const platform = platformIcons[connection.platform] || '⚙️';

  const handleCopy = () => {
    navigator.clipboard.writeText(connection.webhook_url);
    setCopied(true);
    toast.success('Webhook URL copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="group transition-all hover:shadow-sm">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              'h-2 w-2 rounded-full shrink-0',
              connection.is_active ? 'bg-green-500' : 'bg-muted-foreground/30'
            )} />
            <span className="text-base">{platform}</span>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-foreground truncate">{connection.name}</h4>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                <span>{connection.trigger_count} triggers</span>
                <span>•</span>
                <span>Last: {formatDate(connection.last_triggered_at)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {connection.connected_apps?.length > 0 && (
              <div className="hidden sm:flex gap-1">
                {connection.connected_apps.slice(0, 2).map((app) => (
                  <Badge key={app} variant="outline" className="text-[10px] px-1.5 py-0">
                    {app}
                  </Badge>
                ))}
                {connection.connected_apps.length > 2 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    +{connection.connected_apps.length - 2}
                  </Badge>
                )}
              </div>
            )}
            <Switch
              checked={connection.is_active}
              onCheckedChange={onToggle}
              className="shrink-0"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onTest}>
                  <Play className="h-3.5 w-3.5 mr-2" />
                  Send Test
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* URL row */}
        <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
          <code className="flex-1 text-xs font-mono text-foreground truncate select-all">
            {connection.webhook_url}
          </code>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleCopy}>
            {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ── Sync Rule Card ──
interface SyncRuleCardProps {
  rule: ReturnType<typeof useDataSyncRules>['syncRules'][number];
  onToggle: () => void;
  onTest: () => void;
  onDelete: () => void;
  formatDate: (d: string | null) => string;
}

const SyncRuleCard: React.FC<SyncRuleCardProps> = ({
  rule, onToggle, onTest, onDelete, formatDate
}) => {
  return (
    <Card className="group transition-all hover:shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              'h-2 w-2 rounded-full shrink-0',
              rule.is_active ? 'bg-green-500' : 'bg-muted-foreground/30'
            )} />
            <GitBranch className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-foreground truncate">{rule.name}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <span>{rule.source_system} → {rule.target_system}</span>
                <span>•</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{rule.data_type}</Badge>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{rule.frequency}</Badge>
                <span>•</span>
                <span>{rule.sync_count} syncs</span>
                <span>•</span>
                <span>Last: {formatDate(rule.last_sync_at)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={rule.is_active}
              onCheckedChange={onToggle}
              className="shrink-0"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onTest}>
                  <Play className="h-3.5 w-3.5 mr-2" />
                  Manual Sync
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ── Reusable Code Snippet Block ──
const SnippetBlock: React.FC<{ label: string; code: string }> = ({ label, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`${label} snippet copied`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-md border bg-muted/40 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/60">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
          {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <pre className="px-3 py-2 text-[11px] leading-relaxed text-foreground whitespace-pre-wrap font-mono overflow-x-auto">
        {code}
      </pre>
    </div>
  );
};

export default Integrations;
