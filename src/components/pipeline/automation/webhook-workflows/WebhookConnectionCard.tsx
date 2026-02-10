
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Play, Trash2, MoreHorizontal, Copy, Check } from 'lucide-react';
import { WebhookConnection } from '@/hooks/useWebhookConnections';
import { toast } from 'sonner';

interface WebhookConnectionCardProps {
  connection: WebhookConnection;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onTest: (connection: WebhookConnection) => void;
}

const platformConfig: Record<string, { icon: string; label: string }> = {
  zapier: { icon: '⚡', label: 'Zapier' },
  make: { icon: '🔄', label: 'Make' },
  n8n: { icon: '🔗', label: 'n8n' },
  custom: { icon: '⚙️', label: 'Custom' },
};

const WebhookConnectionCard: React.FC<WebhookConnectionCardProps> = ({
  connection,
  onToggle,
  onDelete,
  onTest,
}) => {
  const [copied, setCopied] = useState(false);
  const platform = platformConfig[connection.platform] || platformConfig.custom;

  const handleCopy = () => {
    navigator.clipboard.writeText(connection.webhook_url);
    setCopied(true);
    toast.success('Webhook URL copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="group transition-all hover:shadow-sm">
      <CardContent className="p-4">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`h-2 w-2 rounded-full ${connection.is_active ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
            <span className="text-base">{platform.icon}</span>
            <div>
              <h4 className="text-sm font-semibold">{connection.name}</h4>
              <span className="text-xs text-muted-foreground">{platform.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {connection.trigger_count} triggers
            </span>
            {connection.connected_apps?.length > 0 && (
              <div className="flex gap-1">
                {connection.connected_apps.slice(0, 3).map((app) => (
                  <Badge key={app} variant="outline" className="text-[10px] px-1.5 py-0">
                    {app}
                  </Badge>
                ))}
                {connection.connected_apps.length > 3 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    +{connection.connected_apps.length - 3}
                  </Badge>
                )}
              </div>
            )}
            <Switch
              checked={connection.is_active}
              onCheckedChange={() => onToggle(connection.id)}
              className="ml-1"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onTest(connection)}>
                  <Play className="h-3.5 w-3.5 mr-2" />
                  Send Test
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(connection.id)} className="text-destructive focus:text-destructive">
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

        {connection.last_triggered_at && (
          <p className="text-[10px] text-muted-foreground mt-2">
            Last triggered {new Date(connection.last_triggered_at).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default WebhookConnectionCard;
