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
import { ScrollArea } from '@/components/ui/scroll-area';
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
      <DialogContent className="sm:max-w-[440px] max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Wrench className="h-4 w-4 text-primary" />
            Log Service — {equipment.brand} {equipment.model}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <ScrollArea className="flex-1 px-5">
            <div className="space-y-3 pb-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="service_type" className="text-xs text-foreground">Service Type *</Label>
                  <Select
                    value={formData.service_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, service_type: value }))}
                  >
                    <SelectTrigger className="h-9 bg-background text-foreground border-input">
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

                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-xs text-foreground">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="h-9 bg-background text-foreground border-input">
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

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="service_date" className="text-xs text-foreground">Service Date *</Label>
                  <Input
                    id="service_date"
                    type="date"
                    value={formData.service_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, service_date: e.target.value }))}
                    required
                    className="h-9 bg-background text-foreground border-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="performed_by" className="text-xs text-foreground">Performed By</Label>
                  <Input
                    id="performed_by"
                    placeholder="Technician name"
                    value={formData.performed_by}
                    onChange={(e) => setFormData(prev => ({ ...prev, performed_by: e.target.value }))}
                    className="h-9 bg-background text-foreground border-input"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs text-foreground">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the service performed..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  required
                  className="min-h-[60px] resize-none bg-background text-foreground border-input"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="resolution" className="text-xs text-foreground">Resolution</Label>
                <Textarea
                  id="resolution"
                  placeholder="How was the issue resolved?"
                  value={formData.resolution}
                  onChange={(e) => setFormData(prev => ({ ...prev, resolution: e.target.value }))}
                  rows={1}
                  className="min-h-[36px] resize-none bg-background text-foreground border-input"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="parts_used" className="text-xs text-foreground">Parts Used</Label>
                <Input
                  id="parts_used"
                  placeholder="e.g., Toner cartridge, Drum unit"
                  value={formData.parts_used}
                  onChange={(e) => setFormData(prev => ({ ...prev, parts_used: e.target.value }))}
                  className="h-9 bg-background text-foreground border-input"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="labor_cost" className="text-xs text-foreground">Labor Cost</Label>
                  <Input
                    id="labor_cost"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.labor_cost || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, labor_cost: parseFloat(e.target.value) || 0 }))}
                    className="h-9 bg-background text-foreground border-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="parts_cost" className="text-xs text-foreground">Parts Cost</Label>
                  <Input
                    id="parts_cost"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.parts_cost || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, parts_cost: parseFloat(e.target.value) || 0 }))}
                    className="h-9 bg-background text-foreground border-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="next_service_due" className="text-xs text-foreground">Next Service</Label>
                  <Input
                    id="next_service_due"
                    type="date"
                    value={formData.next_service_due}
                    onChange={(e) => setFormData(prev => ({ ...prev, next_service_due: e.target.value }))}
                    className="h-9 bg-background text-foreground border-input"
                  />
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="px-5 py-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={handleClose} className="text-foreground border-border">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving || !formData.description}>
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-1.5" />
              )}
              Save Log
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LogServiceDialog;
