
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NewZapierConnection } from './types';

interface ZapierConnectionFormProps {
  isOpen: boolean;
  onClose: () => void;
  newConnection: NewZapierConnection;
  onConnectionChange: (connection: NewZapierConnection) => void;
  onCreate: () => void;
}

const ZapierConnectionForm: React.FC<ZapierConnectionFormProps> = ({
  isOpen,
  onClose,
  newConnection,
  onConnectionChange,
  onCreate
}) => {
  const popularApps = [
    'Slack', 'Gmail', 'Google Sheets', 'Salesforce', 'HubSpot', 'Trello',
    'Asana', 'Monday.com', 'Mailchimp', 'Shopify', 'WordPress', 'Dropbox'
  ];

  const handleAppToggle = (app: string, checked: boolean) => {
    if (checked) {
      onConnectionChange({
        ...newConnection,
        apps: [...newConnection.apps, app]
      });
    } else {
      onConnectionChange({
        ...newConnection,
        apps: newConnection.apps.filter(a => a !== app)
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Integration</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Integration Name</Label>
              <Input
                value={newConnection.name}
                onChange={(e) => onConnectionChange({ ...newConnection, name: e.target.value })}
                placeholder="e.g., Customer to Slack"
              />
            </div>
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select 
                value={newConnection.platform} 
                onValueChange={(value: 'zapier' | 'make' | 'n8n') => 
                  onConnectionChange({ ...newConnection, platform: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zapier">⚡ Zapier</SelectItem>
                  <SelectItem value="make">🔄 Make (Integromat)</SelectItem>
                  <SelectItem value="n8n">🔗 n8n</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <Input
              value={newConnection.webhookUrl}
              onChange={(e) => onConnectionChange({ ...newConnection, webhookUrl: e.target.value })}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
            />
          </div>

          <div className="space-y-2">
            <Label>Connected Apps (Optional)</Label>
            <div className="grid grid-cols-3 gap-2">
              {popularApps.map(app => (
                <label key={app} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newConnection.apps.includes(app)}
                    onChange={(e) => handleAppToggle(app, e.target.checked)}
                  />
                  <span className="text-sm">{app}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onCreate}>
              Create Integration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ZapierConnectionForm;
