import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface LoopConfigProps {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

const LoopConfig = ({ config, onChange }: LoopConfigProps) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>Loop Over</Label>
      <Input
        placeholder="e.g., items, customers"
        value={config.collection || ''}
        onChange={(e) => onChange('collection', e.target.value)}
      />
    </div>
    <div className="space-y-2">
      <Label>Item Variable Name</Label>
      <Input
        placeholder="e.g., item"
        value={config.itemVar || 'item'}
        onChange={(e) => onChange('itemVar', e.target.value)}
      />
    </div>
  </div>
);

export default LoopConfig;
