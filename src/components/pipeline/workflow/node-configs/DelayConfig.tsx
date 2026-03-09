import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DelayConfigProps {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

const DelayConfig = ({ config, onChange }: DelayConfigProps) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>Delay Duration</Label>
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Duration"
          value={config.duration || ''}
          onChange={(e) => onChange('duration', e.target.value)}
          className="flex-1"
        />
        <Select value={config.unit || 'minutes'} onValueChange={(v) => onChange('unit', v)}>
          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
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

export default DelayConfig;
