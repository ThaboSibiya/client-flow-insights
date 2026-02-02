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

interface CreateApiTriggerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: {
    name: string;
    method: string;
    auth_type: string;
    description?: string;
    sample_payload?: Record<string, any>;
  }) => Promise<boolean>;
}

const CreateApiTriggerDialog: React.FC<CreateApiTriggerDialogProps> = ({
  open,
  onOpenChange,
  onCreate
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    method: 'POST',
    auth_type: 'none',
    description: '',
    sample_payload: ''
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    let payload: Record<string, any> | undefined;
    if (formData.sample_payload.trim()) {
      try {
        payload = JSON.parse(formData.sample_payload);
      } catch {
        payload = undefined;
      }
    }

    const success = await onCreate({
      name: formData.name,
      method: formData.method,
      auth_type: formData.auth_type,
      description: formData.description || undefined,
      sample_payload: payload
    });
    
    setIsSubmitting(false);
    
    if (success) {
      setFormData({
        name: '',
        method: 'POST',
        auth_type: 'none',
        description: '',
        sample_payload: ''
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create API Trigger</DialogTitle>
          <DialogDescription>
            Create a custom webhook endpoint to receive data from external systems.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Trigger Name</Label>
            <Input
              id="name"
              placeholder="e.g., Customer Status Update"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>HTTP Method</Label>
              <Select
                value={formData.method}
                onValueChange={(value) => setFormData({ ...formData, method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Authentication</Label>
              <Select
                value={formData.auth_type}
                onValueChange={(value) => setFormData({ ...formData, auth_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Public)</SelectItem>
                  <SelectItem value="bearer">Bearer Token</SelectItem>
                  <SelectItem value="apikey">API Key</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="What does this trigger do?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sample_payload">Sample Payload (JSON, optional)</Label>
            <Textarea
              id="sample_payload"
              placeholder='{"customer_id": "123", "status": "active"}'
              value={formData.sample_payload}
              onChange={(e) => setFormData({ ...formData, sample_payload: e.target.value })}
              className="font-mono text-sm"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!formData.name || isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Trigger'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateApiTriggerDialog;
