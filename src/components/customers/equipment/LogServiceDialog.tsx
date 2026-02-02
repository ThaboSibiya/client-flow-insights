import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Wrench, Save, Loader2 } from 'lucide-react';
import { Equipment, ServiceFormData } from './types';

interface LogServiceDialogProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (equipmentId: string, data: ServiceFormData) => Promise<boolean>;
  saving?: boolean;
}

const initialFormData: ServiceFormData = {
  service_type: 'maintenance',
  service_date: new Date().toISOString().split('T')[0],
  performed_by: '',
  description: '',
  resolution: '',
  parts_used: '',
  labor_cost: 0,
  parts_cost: 0,
  next_service_due: '',
  status: 'completed'
};

const LogServiceDialog = ({ equipment, isOpen, onClose, onSave, saving }: LogServiceDialogProps) => {
  const [formData, setFormData] = useState<ServiceFormData>(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipment) return;

    const success = await onSave(equipment.id, formData);
    if (success) {
      setFormData(initialFormData);
      onClose();
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    onClose();
  };

  if (!equipment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            Log Service - {equipment.brand} {equipment.model}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service_type">Service Type *</Label>
              <Select
                value={formData.service_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, service_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="installation">Installation</SelectItem>
                  <SelectItem value="replacement">Replacement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service_date">Service Date *</Label>
              <Input
                id="service_date"
                type="date"
                value={formData.service_date}
                onChange={(e) => setFormData(prev => ({ ...prev, service_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="performed_by">Performed By</Label>
              <Input
                id="performed_by"
                placeholder="Technician name"
                value={formData.performed_by}
                onChange={(e) => setFormData(prev => ({ ...prev, performed_by: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the service performed..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resolution">Resolution</Label>
            <Textarea
              id="resolution"
              placeholder="How was the issue resolved?"
              value={formData.resolution}
              onChange={(e) => setFormData(prev => ({ ...prev, resolution: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parts_used">Parts Used (comma separated)</Label>
            <Input
              id="parts_used"
              placeholder="e.g., Toner cartridge, Drum unit, Fuser"
              value={formData.parts_used}
              onChange={(e) => setFormData(prev => ({ ...prev, parts_used: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="labor_cost">Labor Cost</Label>
              <Input
                id="labor_cost"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.labor_cost || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, labor_cost: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parts_cost">Parts Cost</Label>
              <Input
                id="parts_cost"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.parts_cost || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, parts_cost: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_service_due">Next Service Due</Label>
              <Input
                id="next_service_due"
                type="date"
                value={formData.next_service_due}
                onChange={(e) => setFormData(prev => ({ ...prev, next_service_due: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !formData.description}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Service Log
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LogServiceDialog;
