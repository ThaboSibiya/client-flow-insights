
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NewCustomApiTrigger } from './types';

interface CustomApiTriggerFormProps {
  isOpen: boolean;
  onClose: () => void;
  newTrigger: NewCustomApiTrigger;
  onTriggerChange: (trigger: NewCustomApiTrigger) => void;
  onCreate: () => void;
  onGenerateEndpoint: () => void;
}

const CustomApiTriggerForm: React.FC<CustomApiTriggerFormProps> = ({
  isOpen,
  onClose,
  newTrigger,
  onTriggerChange,
  onCreate,
  onGenerateEndpoint
}) => {
  if (!isOpen) return null;

  return (
    <DialogContent className="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Create Custom API Trigger</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Trigger Name</Label>
            <Input
              value={newTrigger.name}
              onChange={(e) => onTriggerChange({ ...newTrigger, name: e.target.value })}
              placeholder="e.g., Order Completed"
            />
          </div>
          <div className="space-y-2">
            <Label>HTTP Method</Label>
            <Select 
              value={newTrigger.method} 
              onValueChange={(value: 'GET' | 'POST' | 'PUT' | 'DELETE') => 
                onTriggerChange({ ...newTrigger, method: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>API Endpoint</Label>
            <Button 
              size="sm" 
              variant="outline"
              onClick={onGenerateEndpoint}
            >
              Generate
            </Button>
          </div>
          <Input
            value={newTrigger.endpoint}
            onChange={(e) => onTriggerChange({ ...newTrigger, endpoint: e.target.value })}
            placeholder="/api/webhooks/your-endpoint"
          />
        </div>

        <div className="space-y-2">
          <Label>Authentication Type</Label>
          <Select 
            value={newTrigger.authType} 
            onValueChange={(value: 'none' | 'bearer' | 'apikey' | 'basic') => 
              onTriggerChange({ ...newTrigger, authType: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Authentication</SelectItem>
              <SelectItem value="bearer">Bearer Token</SelectItem>
              <SelectItem value="apikey">API Key</SelectItem>
              <SelectItem value="basic">Basic Auth</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={newTrigger.description}
            onChange={(e) => onTriggerChange({ ...newTrigger, description: e.target.value })}
            placeholder="Describe when this trigger should be used..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Sample Payload (JSON)</Label>
          <Textarea
            value={newTrigger.samplePayload}
            onChange={(e) => onTriggerChange({ ...newTrigger, samplePayload: e.target.value })}
            placeholder='{"key": "value", "timestamp": "2024-01-22T10:30:00Z"}'
            rows={6}
            className="font-mono text-sm"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onCreate}>
            Create Trigger
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default CustomApiTriggerForm;
