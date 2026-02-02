import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface CreateSyncRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: {
    name: string;
    source_system: string;
    target_system: string;
    data_type: string;
    sync_direction: 'push' | 'pull' | 'bidirectional';
    frequency: 'real-time' | 'hourly' | 'daily' | 'manual';
  }) => Promise<boolean>;
}

const systemOptions = [
  'Quikle CRM',
  'Salesforce',
  'HubSpot',
  'Slack',
  'Shopify',
  'Google Sheets',
  'Airtable',
  'Custom API'
];

const dataTypeOptions = [
  'customers',
  'tickets',
  'products',
  'orders',
  'invoices',
  'contacts',
  'events'
];

const CreateSyncRuleDialog: React.FC<CreateSyncRuleDialogProps> = ({
  open,
  onOpenChange,
  onCreate
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    source_system: '',
    target_system: '',
    data_type: '',
    sync_direction: 'bidirectional' as 'push' | 'pull' | 'bidirectional',
    frequency: 'real-time' as 'real-time' | 'hourly' | 'daily' | 'manual'
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const success = await onCreate(formData);
    setIsSubmitting(false);
    
    if (success) {
      setFormData({
        name: '',
        source_system: '',
        target_system: '',
        data_type: '',
        sync_direction: 'bidirectional',
        frequency: 'real-time'
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Sync Rule</DialogTitle>
          <DialogDescription>
            Configure data synchronization between your systems.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Rule Name</Label>
            <Input
              id="name"
              placeholder="e.g., Customer Data Sync"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Source System</Label>
              <Select
                value={formData.source_system}
                onValueChange={(value) => setFormData({ ...formData, source_system: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source..." />
                </SelectTrigger>
                <SelectContent>
                  {systemOptions.map(system => (
                    <SelectItem key={system} value={system}>{system}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target System</Label>
              <Select
                value={formData.target_system}
                onValueChange={(value) => setFormData({ ...formData, target_system: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target..." />
                </SelectTrigger>
                <SelectContent>
                  {systemOptions.map(system => (
                    <SelectItem key={system} value={system}>{system}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Data Type</Label>
            <Select
              value={formData.data_type}
              onValueChange={(value) => setFormData({ ...formData, data_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select data type..." />
              </SelectTrigger>
              <SelectContent>
                {dataTypeOptions.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Sync Direction</Label>
              <Select
                value={formData.sync_direction}
                onValueChange={(value: 'push' | 'pull' | 'bidirectional') => 
                  setFormData({ ...formData, sync_direction: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="push">Push (→)</SelectItem>
                  <SelectItem value="pull">Pull (←)</SelectItem>
                  <SelectItem value="bidirectional">Bidirectional (↔)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value: 'real-time' | 'hourly' | 'daily' | 'manual') => 
                  setFormData({ ...formData, frequency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="real-time">Real-time</SelectItem>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="manual">Manual Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!formData.name || !formData.source_system || !formData.target_system || !formData.data_type || isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Rule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSyncRuleDialog;
