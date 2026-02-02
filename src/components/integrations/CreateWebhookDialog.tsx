import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface CreateWebhookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: {
    name: string;
    platform: 'zapier' | 'make' | 'n8n' | 'custom';
    webhook_url: string;
    connected_apps: string[];
  }) => Promise<boolean>;
}

const platformOptions = [
  { value: 'zapier', label: 'Zapier', icon: '⚡' },
  { value: 'make', label: 'Make (Integromat)', icon: '🔄' },
  { value: 'n8n', label: 'n8n', icon: '🔗' },
  { value: 'custom', label: 'Custom Webhook', icon: '🔧' }
];

const CreateWebhookDialog: React.FC<CreateWebhookDialogProps> = ({
  open,
  onOpenChange,
  onCreate
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    platform: 'zapier' as 'zapier' | 'make' | 'n8n' | 'custom',
    webhook_url: '',
    connected_apps: [] as string[]
  });
  const [appInput, setAppInput] = useState('');

  const handleAddApp = () => {
    if (appInput.trim() && !formData.connected_apps.includes(appInput.trim())) {
      setFormData({
        ...formData,
        connected_apps: [...formData.connected_apps, appInput.trim()]
      });
      setAppInput('');
    }
  };

  const handleRemoveApp = (app: string) => {
    setFormData({
      ...formData,
      connected_apps: formData.connected_apps.filter(a => a !== app)
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const success = await onCreate(formData);
    setIsSubmitting(false);
    
    if (success) {
      setFormData({
        name: '',
        platform: 'zapier',
        webhook_url: '',
        connected_apps: []
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Webhook Connection</DialogTitle>
          <DialogDescription>
            Connect to automation platforms like Zapier, Make, or n8n.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Connection Name</Label>
            <Input
              id="name"
              placeholder="e.g., New Customer to Slack"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Platform</Label>
            <Select
              value={formData.platform}
              onValueChange={(value: 'zapier' | 'make' | 'n8n' | 'custom') => 
                setFormData({ ...formData, platform: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {platformOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook_url">Webhook URL</Label>
            <Input
              id="webhook_url"
              type="url"
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              value={formData.webhook_url}
              onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Paste the webhook URL from your automation platform.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Connected Apps (optional)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Slack, Gmail"
                value={appInput}
                onChange={(e) => setAppInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddApp())}
              />
              <Button type="button" variant="outline" onClick={handleAddApp}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.connected_apps.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.connected_apps.map(app => (
                  <Badge key={app} variant="secondary" className="gap-1">
                    {app}
                    <button onClick={() => handleRemoveApp(app)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!formData.name || !formData.webhook_url || isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Connection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWebhookDialog;
