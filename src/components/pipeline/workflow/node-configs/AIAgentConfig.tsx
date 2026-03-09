import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface AIAgentConfigProps {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

const AIAgentConfig = ({ config, onChange }: AIAgentConfigProps) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>Agent Persona</Label>
      <Input
        placeholder="e.g., Customer Support Agent"
        value={config.persona || ''}
        onChange={(e) => onChange('persona', e.target.value)}
      />
    </div>
    <div className="space-y-2">
      <Label>Role Description</Label>
      <Textarea
        placeholder="Describe the agent's role and capabilities..."
        value={config.role || ''}
        onChange={(e) => onChange('role', e.target.value)}
        rows={3}
      />
    </div>
    <div className="space-y-2">
      <Label>Tone</Label>
      <Select value={config.tone || 'professional'} onValueChange={(v) => onChange('tone', v)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
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
        {['Search', 'Email', 'Database', 'API'].map((tool) => (
          <Badge
            key={tool}
            variant={config.tools?.includes(tool) ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => {
              const tools = config.tools || [];
              const newTools = tools.includes(tool)
                ? tools.filter((t: string) => t !== tool)
                : [...tools, tool];
              onChange('tools', newTools);
            }}
          >
            {tool}
          </Badge>
        ))}
      </div>
    </div>
  </div>
);

export default AIAgentConfig;
