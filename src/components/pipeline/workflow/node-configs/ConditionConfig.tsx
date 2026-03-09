import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ConditionConfigProps {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

const ConditionConfig = ({ config, onChange }: ConditionConfigProps) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>Condition Field</Label>
      <Input
        placeholder="e.g., customer.status"
        value={config.field || ''}
        onChange={(e) => onChange('field', e.target.value)}
      />
    </div>
    <div className="space-y-2">
      <Label>Operator</Label>
      <Select value={config.operator || 'equals'} onValueChange={(v) => onChange('operator', v)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
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
        value={config.value || ''}
        onChange={(e) => onChange('value', e.target.value)}
      />
    </div>
  </div>
);

export default ConditionConfig;
