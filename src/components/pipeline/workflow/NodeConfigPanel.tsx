import React from 'react';
import { X, Trash2, Settings2, Bot, MessageSquare, Tags, FileSearch, GitBranch, RefreshCw, Clock, AlertTriangle, Mail, Phone, Database, Globe, Play, UserCheck, Webhook, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CustomNode } from './types';
import { CATEGORY_LABELS } from './constants';
import AIAgentConfig from './node-configs/AIAgentConfig';
import ConditionConfig from './node-configs/ConditionConfig';
import DelayConfig from './node-configs/DelayConfig';
import EmailConfig from './node-configs/EmailConfig';
import LoopConfig from './node-configs/LoopConfig';
import ApiCallConfig from './node-configs/ApiCallConfig';
import DatabaseConfig from './node-configs/DatabaseConfig';
import DefaultConfig from './node-configs/DefaultConfig';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  trigger: Zap, webhook: Webhook, ai_agent: Bot, ai_chat: MessageSquare,
  ai_classify: Tags, ai_extract: FileSearch, condition: GitBranch,
  loop: RefreshCw, delay: Clock, error_handler: AlertTriangle,
  email: Mail, sms: Phone, database: Database, api_call: Globe,
  action: Play, approval: UserCheck,
};

interface NodeConfigPanelProps {
  node: CustomNode | null;
  onClose: () => void;
  onUpdate: (nodeId: string, data: Partial<CustomNode['data']>) => void;
  onDelete: (nodeId: string) => void;
}

const NodeConfigPanel = ({ node, onClose, onUpdate, onDelete }: NodeConfigPanelProps) => {
  if (!node) return null;

  const Icon = iconMap[node.data.type] || Settings2;

  const handleConfigChange = (key: string, value: any) => {
    onUpdate(node.id, { config: { ...node.data.config, [key]: value } });
  };

  const renderConfigFields = () => {
    const { type, config } = node.data;
    switch (type) {
      case 'ai_agent': return <AIAgentConfig config={config} onChange={handleConfigChange} />;
      case 'condition': return <ConditionConfig config={config} onChange={handleConfigChange} />;
      case 'delay': return <DelayConfig config={config} onChange={handleConfigChange} />;
      case 'email': return <EmailConfig config={config} onChange={handleConfigChange} />;
      case 'loop': return <LoopConfig config={config} onChange={handleConfigChange} />;
      case 'api_call': return <ApiCallConfig config={config} onChange={handleConfigChange} />;
      case 'database': return <DatabaseConfig config={config} onChange={handleConfigChange} />;
      default: return <DefaultConfig config={config} onUpdate={(c) => onUpdate(node.id, { config: c })} />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-background border-l w-80">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Configure Node</h3>
            <Badge variant="secondary" className="text-xs mt-0.5">
              {CATEGORY_LABELS[node.data.category]}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <div className="space-y-2">
            <Label>Node Name</Label>
            <Input
              value={node.data.name}
              onChange={(e) => onUpdate(node.id, { name: e.target.value })}
            />
          </div>
          <Separator />
          {renderConfigFields()}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <Button variant="destructive" size="sm" className="w-full" onClick={() => onDelete(node.id)}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Node
        </Button>
      </div>
    </div>
  );
};

export default NodeConfigPanel;
