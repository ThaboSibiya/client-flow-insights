
import React from 'react';
import { X, Trash2, Settings2, Bot, MessageSquare, Tags, FileSearch, GitBranch, RefreshCw, Clock, AlertTriangle, Mail, Phone, Database, Globe, Play, UserCheck, Webhook, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CustomNode, WorkflowNodeType } from './types';
import { CATEGORY_LABELS } from './constants';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  trigger: Zap,
  webhook: Webhook,
  ai_agent: Bot,
  ai_chat: MessageSquare,
  ai_classify: Tags,
  ai_extract: FileSearch,
  condition: GitBranch,
  loop: RefreshCw,
  delay: Clock,
  error_handler: AlertTriangle,
  email: Mail,
  sms: Phone,
  database: Database,
  api_call: Globe,
  action: Play,
  approval: UserCheck,
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

  const handleNameChange = (name: string) => {
    onUpdate(node.id, { name });
  };

  const handleConfigChange = (key: string, value: any) => {
    onUpdate(node.id, { 
      config: { ...node.data.config, [key]: value } 
    });
  };

  const renderConfigFields = () => {
    switch (node.data.type) {
      case 'ai_agent':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Agent Persona</Label>
              <Input 
                placeholder="e.g., Customer Support Agent"
                value={node.data.config.persona || ''}
                onChange={(e) => handleConfigChange('persona', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Role Description</Label>
              <Textarea 
                placeholder="Describe the agent's role and capabilities..."
                value={node.data.config.role || ''}
                onChange={(e) => handleConfigChange('role', e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select 
                value={node.data.config.tone || 'professional'}
                onValueChange={(value) => handleConfigChange('tone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="formal">Formal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Available Tools</Label>
              <div className="flex flex-wrap gap-2">
                {['Search', 'Email', 'Database', 'API'].map(tool => (
                  <Badge 
                    key={tool}
                    variant={node.data.config.tools?.includes(tool) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const tools = node.data.config.tools || [];
                      const newTools = tools.includes(tool) 
                        ? tools.filter((t: string) => t !== tool)
                        : [...tools, tool];
                      handleConfigChange('tools', newTools);
                    }}
                  >
                    {tool}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 'condition':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Condition Field</Label>
              <Input 
                placeholder="e.g., customer.status"
                value={node.data.config.field || ''}
                onChange={(e) => handleConfigChange('field', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Operator</Label>
              <Select 
                value={node.data.config.operator || 'equals'}
                onValueChange={(value) => handleConfigChange('operator', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="not_equals">Not Equals</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="greater_than">Greater Than</SelectItem>
                  <SelectItem value="less_than">Less Than</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Value</Label>
              <Input 
                placeholder="Compare value"
                value={node.data.config.value || ''}
                onChange={(e) => handleConfigChange('value', e.target.value)}
              />
            </div>
          </div>
        );

      case 'delay':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Delay Duration</Label>
              <div className="flex gap-2">
                <Input 
                  type="number"
                  placeholder="Duration"
                  value={node.data.config.duration || ''}
                  onChange={(e) => handleConfigChange('duration', e.target.value)}
                  className="flex-1"
                />
                <Select 
                  value={node.data.config.unit || 'minutes'}
                  onValueChange={(value) => handleConfigChange('unit', value)}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seconds">Seconds</SelectItem>
                    <SelectItem value="minutes">Minutes</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>To</Label>
              <Input 
                placeholder="{{customer.email}}"
                value={node.data.config.to || ''}
                onChange={(e) => handleConfigChange('to', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input 
                placeholder="Email subject"
                value={node.data.config.subject || ''}
                onChange={(e) => handleConfigChange('subject', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea 
                placeholder="Email content..."
                value={node.data.config.body || ''}
                onChange={(e) => handleConfigChange('body', e.target.value)}
                rows={4}
              />
            </div>
          </div>
        );

      case 'loop':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Loop Over</Label>
              <Input 
                placeholder="e.g., items, customers"
                value={node.data.config.collection || ''}
                onChange={(e) => handleConfigChange('collection', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Item Variable Name</Label>
              <Input 
                placeholder="e.g., item"
                value={node.data.config.itemVar || 'item'}
                onChange={(e) => handleConfigChange('itemVar', e.target.value)}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Configuration</Label>
              <Textarea 
                placeholder="Add custom configuration..."
                value={JSON.stringify(node.data.config, null, 2)}
                onChange={(e) => {
                  try {
                    const config = JSON.parse(e.target.value);
                    onUpdate(node.id, { config });
                  } catch {}
                }}
                rows={6}
                className="font-mono text-sm"
              />
            </div>
          </div>
        );
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
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>

          <Separator />

          {renderConfigFields()}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <Button 
          variant="destructive" 
          size="sm" 
          className="w-full"
          onClick={() => onDelete(node.id)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Node
        </Button>
      </div>
    </div>
  );
};

export default NodeConfigPanel;
