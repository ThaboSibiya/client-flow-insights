import React, { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Printer, Save, Loader2 } from 'lucide-react';
import { Equipment, EquipmentFormData } from './types';

interface EquipmentFormDialogProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EquipmentFormData, editingId?: string) => Promise<boolean>;
  saving?: boolean;
}

const initialFormData: EquipmentFormData = {
  equipment_type: 'printer',
  brand: '',
  model: '',
  serial_number: '',
  status: 'active',
  purchase_date: '',
  warranty_expiry: '',
  notes: '',
  technical_issues: ''
};

const EquipmentFormDialog = ({ equipment, isOpen, onClose, onSave, saving }: EquipmentFormDialogProps) => {
  const [formData, setFormData] = useState<EquipmentFormData>(
    equipment 
      ? {
          equipment_type: equipment.equipment_type,
          brand: equipment.brand || '',
          model: equipment.model || '',
          serial_number: equipment.serial_number || '',
          status: equipment.status,
          purchase_date: equipment.purchase_date || '',
          warranty_expiry: equipment.warranty_expiry || '',
          notes: equipment.notes || '',
          technical_issues: equipment.technical_issues || ''
        }
      : initialFormData
  );

  React.useEffect(() => {
    if (equipment) {
      setFormData({
        equipment_type: equipment.equipment_type,
        brand: equipment.brand || '',
        model: equipment.model || '',
        serial_number: equipment.serial_number || '',
        status: equipment.status,
        purchase_date: equipment.purchase_date || '',
        warranty_expiry: equipment.warranty_expiry || '',
        notes: equipment.notes || '',
        technical_issues: equipment.technical_issues || ''
      });
    } else {
      setFormData(initialFormData);
    }
  }, [equipment, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSave(formData, equipment?.id);
    if (success) {
      setFormData(initialFormData);
      onClose();
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[440px] max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Printer className="h-4 w-4 text-primary" />
            {equipment ? 'Edit Equipment' : 'Add Equipment'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <ScrollArea className="flex-1 px-5">
            <div className="space-y-3 pb-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="equipment_type" className="text-xs text-foreground">Type *</Label>
                  <Select
                    value={formData.equipment_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, equipment_type: value }))}
                  >
                    <SelectTrigger className="h-9 bg-background text-foreground border-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="printer">Printer</SelectItem>
                      <SelectItem value="scanner">Scanner</SelectItem>
                      <SelectItem value="copier">Copier</SelectItem>
                      <SelectItem value="fax">Fax Machine</SelectItem>
                      <SelectItem value="multifunction">Multifunction</SelectItem>
                      <SelectItem value="computer">Computer</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-xs text-foreground">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="h-9 bg-background text-foreground border-input">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="broken">Broken</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="brand" className="text-xs text-foreground">Brand *</Label>
                  <Input
                    id="brand"
                    placeholder="e.g., HP, Canon"
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    required
                    className="h-9 bg-background text-foreground border-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="model" className="text-xs text-foreground">Model *</Label>
                  <Input
                    id="model"
                    placeholder="Model number"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    required
                    className="h-9 bg-background text-foreground border-input"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="serial_number" className="text-xs text-foreground">Serial Number</Label>
                <Input
                  id="serial_number"
                  placeholder="Enter serial number"
                  value={formData.serial_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, serial_number: e.target.value }))}
                  className="h-9 bg-background text-foreground border-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="purchase_date" className="text-xs text-foreground">Purchase Date</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchase_date: e.target.value }))}
                    className="h-9 bg-background text-foreground border-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="warranty_expiry" className="text-xs text-foreground">Warranty Expiry</Label>
                  <Input
                    id="warranty_expiry"
                    type="date"
                    value={formData.warranty_expiry}
                    onChange={(e) => setFormData(prev => ({ ...prev, warranty_expiry: e.target.value }))}
                    className="h-9 bg-background text-foreground border-input"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="technical_issues" className="text-xs text-foreground">Technical Issues</Label>
                <Textarea
                  id="technical_issues"
                  placeholder="Known technical issues..."
                  value={formData.technical_issues}
                  onChange={(e) => setFormData(prev => ({ ...prev, technical_issues: e.target.value }))}
                  rows={1}
                  className="min-h-[36px] resize-none bg-background text-foreground border-input"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs text-foreground">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={1}
                  className="min-h-[36px] resize-none bg-background text-foreground border-input"
                />
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="px-5 py-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={handleClose} className="text-foreground border-border">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving || !formData.brand || !formData.model}>
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-1.5" />
              )}
              {equipment ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentFormDialog;
