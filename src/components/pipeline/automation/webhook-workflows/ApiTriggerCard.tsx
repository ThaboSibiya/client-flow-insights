
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Copy, Play, Trash2, MoreHorizontal, Code, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { ApiTrigger } from '@/hooks/useApiTriggers';
import { toast } from 'sonner';

interface ApiTriggerCardProps {
  trigger: ApiTrigger;
  webhookUrl: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onTest: (trigger: ApiTrigger) => void;
  onCopy: (endpointKey: string) => void;
}

const ApiTriggerCard: React.FC<ApiTriggerCardProps> = ({
  trigger,
  webhookUrl,
  onToggle,
  onDelete,
  onTest,
  onCopy,
}) => {
  const [showSnippets, setShowSnippets] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success('URL copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const curlSnippet = `curl -X ${trigger.method} \\
  "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(trigger.sample_payload || { test: true }, null, 2)}'`;

  const jsSnippet = `const response = await fetch("${webhookUrl}", {
  method: "${trigger.method}",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(${JSON.stringify(trigger.sample_payload || { test: true }, null, 2)})
});`;

  return (
    <Card className="group transition-all hover:shadow-sm">
      <CardContent className="p-4">
        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`h-2 w-2 rounded-full ${trigger.is_active ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
            <div>
              <h4 className="text-sm font-semibold">{trigger.name}</h4>
              {trigger.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{trigger.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono">
              {trigger.method}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {trigger.trigger_count ?? 0} calls
            </span>
            <Switch
              checked={trigger.is_active ?? false}
              onCheckedChange={() => onToggle(trigger.id)}
              className="ml-1"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onTest(trigger)}>
                  <Play className="h-3.5 w-3.5 mr-2" />
                  Send Test
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(trigger.id)} className="text-destructive focus:text-destructive">
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
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {/* Snippets toggle */}
        <button
          onClick={() => setShowSnippets(!showSnippets)}
          className="flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Code className="h-3 w-3" />
          Code snippets
          {showSnippets ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>

        {showSnippets && (
          <div className="mt-2 space-y-2">
            <SnippetBlock label="cURL" code={curlSnippet} />
            <SnippetBlock label="JavaScript" code={jsSnippet} />
          </div>
        )}

        {/* Metadata */}
        {trigger.last_triggered_at && (
          <p className="text-[10px] text-muted-foreground mt-2">
            Last triggered {new Date(trigger.last_triggered_at).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const SnippetBlock = ({ label, code }: { label: string; code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`${label} snippet copied`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={handleCopy}>
          {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <pre className="text-[11px] bg-muted rounded-md p-3 overflow-x-auto font-mono leading-relaxed">
        {code}
      </pre>
    </div>
  );
};

export default ApiTriggerCard;
