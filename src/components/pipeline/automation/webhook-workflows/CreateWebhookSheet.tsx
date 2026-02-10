
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Zap } from 'lucide-react';
import { NewWebhookConnection } from '@/hooks/useWebhookConnections';

interface CreateWebhookSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateConnection: (connection: NewWebhookConnection) => Promise<boolean>;
}

const CreateWebhookSheet: React.FC<CreateWebhookSheetProps> = ({
  open,
  onOpenChange,
  onCreateConnection,
}) => {
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState<'zapier' | 'make' | 'n8n' | 'custom'>('zapier');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const platformHints: Record<string, string> = {
    zapier: 'https://hooks.zapier.com/hooks/catch/...',
    make: 'https://hook.us1.make.com/...',
    n8n: 'https://your-n8n.app/webhook/...',
    custom: 'https://your-api.com/webhook',
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    const success = await onCreateConnection({
      name,
      platform,
      webhook_url: webhookUrl,
      connected_apps: [],
    });
    setIsSubmitting(false);

    if (success) {
      setName('');
      setWebhookUrl('');
      setPlatform('zapier');
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div>
              <SheetTitle>Add Webhook Connection</SheetTitle>
              <SheetDescription>
                Send CRM events to Zapier, Make, n8n, or any webhook URL.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-5 mt-6">
          <div className="space-y-2">
            <Label htmlFor="webhook-name">Name</Label>
            <Input
              id="webhook-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., New Customer → Slack"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={platform} onValueChange={(v: typeof platform) => setPlatform(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zapier">⚡ Zapier</SelectItem>
                <SelectItem value="make">🔄 Make (Integromat)</SelectItem>
                <SelectItem value="n8n">🔗 n8n</SelectItem>
                <SelectItem value="custom">⚙️ Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder={platformHints[platform]}
              className="font-mono text-xs"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreate}
              disabled={!name.trim() || !webhookUrl.trim() || isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Connection'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CreateWebhookSheet;
