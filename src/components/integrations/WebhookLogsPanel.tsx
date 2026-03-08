import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useWebhookLogs } from '@/hooks/useWebhookLogs';
import { cn } from '@/lib/utils';

const WebhookLogsPanel: React.FC = () => {
  const { logs, isLoading, refetch } = useWebhookLogs(30);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No webhook activity yet</p>
        <p className="text-xs text-muted-foreground mt-1">Logs will appear here when webhooks are triggered</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Activity</h2>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{logs.length}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()} className="h-7 text-xs">
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>

      <ScrollArea className="max-h-[400px]">
        <div className="space-y-1.5">
          {logs.map((log) => (
            <Collapsible
              key={log.id}
              open={expandedLog === log.id}
              onOpenChange={(open) => setExpandedLog(open ? log.id : null)}
            >
              <CollapsibleTrigger asChild>
                <Card className="cursor-pointer hover:bg-muted/30 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      {log.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                            {log.request_method || 'POST'}
                          </Badge>
                          <span className="text-xs text-muted-foreground truncate">
                            {log.response_status ? `HTTP ${log.response_status}` : 'No status'}
                          </span>
                          {log.error_message && (
                            <span className="text-xs text-destructive truncate">
                              {log.error_message}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatDate(log.created_at)}
                      </span>
                      {expandedLog === log.id ? (
                        <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-7 mt-1 rounded-md border bg-muted/30 p-3 space-y-2">
                  {log.request_payload && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Payload</p>
                      <pre className="text-[11px] font-mono text-foreground whitespace-pre-wrap overflow-x-auto max-h-32">
                        {JSON.stringify(log.request_payload, null, 2)}
                      </pre>
                    </div>
                  )}
                  {log.response_body && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Response</p>
                      <pre className="text-[11px] font-mono text-foreground whitespace-pre-wrap overflow-x-auto max-h-32">
                        {log.response_body}
                      </pre>
                    </div>
                  )}
                  {log.error_message && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-destructive mb-1">Error</p>
                      <p className="text-xs text-destructive">{log.error_message}</p>
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default WebhookLogsPanel;
