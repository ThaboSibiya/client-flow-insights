import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Play, Trash2, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useWebhookConnections } from '@/hooks/useWebhookConnections';

const platformIcons: Record<string, string> = {
  zapier: '⚡',
  make: '🔄',
  n8n: '🔗',
  custom: '⚙️',
};

interface WebhookCardProps {
  connection: ReturnType<typeof useWebhookConnections>['connections'][number];
  onToggle: () => void;
  onTest: () => void;
  onDelete: () => void;
  formatDate: (d: string | null) => string;
}

const WebhookCard: React.FC<WebhookCardProps> = ({
  connection, onToggle, onTest, onDelete, formatDate,
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
            <Switch checked={connection.is_active} onCheckedChange={onToggle} className="shrink-0" />
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

export default WebhookCard;
