import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ApiCallConfigProps {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

const ApiCallConfig = ({ config, onChange }: ApiCallConfigProps) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>Method</Label>
      <Select value={config.method || 'GET'} onValueChange={(v) => onChange('method', v)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="GET">GET</SelectItem>
          <SelectItem value="POST">POST</SelectItem>
          <SelectItem value="PUT">PUT</SelectItem>
          <SelectItem value="DELETE">DELETE</SelectItem>
          <SelectItem value="PATCH">PATCH</SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className="space-y-2">
      <Label>URL</Label>
      <Input
        placeholder="https://api.example.com/endpoint"
        value={config.url || ''}
        onChange={(e) => onChange('url', e.target.value)}
      />
    </div>
    <div className="space-y-2">
      <Label>Headers (JSON)</Label>
      <Textarea
        placeholder='{"Authorization": "Bearer {{token}}"}'
        value={config.headers || ''}
        onChange={(e) => onChange('headers', e.target.value)}
        rows={3}
        className="font-mono text-sm"
      />
    </div>
    <div className="space-y-2">
      <Label>Body (JSON)</Label>
      <Textarea
        placeholder='{"key": "value"}'
        value={config.body || ''}
        onChange={(e) => onChange('body', e.target.value)}
        rows={4}
        className="font-mono text-sm"
      />
    </div>
  </div>
);

export default ApiCallConfig;
