import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface DefaultConfigProps {
  config: Record<string, any>;
  onUpdate: (config: Record<string, any>) => void;
}

const DefaultConfig = ({ config, onUpdate }: DefaultConfigProps) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>Configuration</Label>
      <Textarea
        placeholder="Add custom configuration..."
        value={JSON.stringify(config, null, 2)}
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            onUpdate(parsed);
          } catch {
            // Invalid JSON, ignore
          }
        }}
        rows={6}
        className="font-mono text-sm"
      />
    </div>
  </div>
);

export default DefaultConfig;
