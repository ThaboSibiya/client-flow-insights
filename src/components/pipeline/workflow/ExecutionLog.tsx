import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2, AlertTriangle, Info } from 'lucide-react';
import { ExecutionLog as ExecutionLogEntry } from '@/hooks/useWorkflowExecutor';

interface ExecutionLogProps {
  logs: ExecutionLogEntry[];
  isRunning: boolean;
}

const levelConfig = {
  info: { icon: Info, color: 'text-muted-foreground', bg: 'bg-muted' },
  success: { icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary/10' },
  error: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
  warn: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
};

const ExecutionLogPanel = ({ logs, isRunning }: ExecutionLogProps) => {
  if (logs.length === 0 && !isRunning) return null;

  return (
    <div className="border-t bg-muted/20">
      <div className="px-4 py-2 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Execution Log
          </span>
          {isRunning && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Running
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{logs.length} entries</span>
      </div>
      <ScrollArea className="h-36">
        <div className="p-2 space-y-1">
          {logs.map((log, i) => {
            const config = levelConfig[log.level];
            const Icon = config.icon;
            return (
              <div key={i} className={`flex items-start gap-2 px-2 py-1.5 rounded text-xs ${config.bg}`}>
                <Icon className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${config.color}`} />
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{log.nodeName}</span>
                  <span className="text-muted-foreground ml-1.5">{log.message}</span>
                </div>
                <span className="text-muted-foreground flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ExecutionLogPanel;
