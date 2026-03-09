import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface EmailConfigProps {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

const EmailConfig = ({ config, onChange }: EmailConfigProps) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label>To</Label>
      <Input
        placeholder="{{customer.email}}"
        value={config.to || ''}
        onChange={(e) => onChange('to', e.target.value)}
      />
    </div>
    <div className="space-y-2">
      <Label>Subject</Label>
      <Input
        placeholder="Email subject"
        value={config.subject || ''}
        onChange={(e) => onChange('subject', e.target.value)}
      />
    </div>
    <div className="space-y-2">
      <Label>Body</Label>
      <Textarea
        placeholder="Email content..."
        value={config.body || ''}
        onChange={(e) => onChange('body', e.target.value)}
        rows={4}
      />
    </div>
  </div>
);

export default EmailConfig;
