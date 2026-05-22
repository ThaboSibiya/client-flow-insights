import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  MoreHorizontal, Play, Trash2, Copy, Check, Code, ChevronDown, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useApiTriggers } from '@/hooks/useApiTriggers';
import SnippetBlock from './SnippetBlock';

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
  trigger, webhookUrl, onToggle, onTest, onDelete, formatDate,
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
            <Switch checked={trigger.is_active} onCheckedChange={onToggle} className="shrink-0" />
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
            {webhookUrl}
          </code>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleCopy}>
            {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>

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

export default ApiTriggerCard;
