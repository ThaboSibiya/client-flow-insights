import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Printer, Package } from 'lucide-react';
import { useEquipmentService } from '@/hooks/useEquipmentService';
import { Equipment, EquipmentFormData } from './types';
import EquipmentCard from './EquipmentCard';
import EquipmentFormDialog from './EquipmentFormDialog';
import LogServiceDialog from './LogServiceDialog';
import EquipmentQuickView from './EquipmentQuickView';
import { Skeleton } from '@/components/ui/skeleton';
import { useTicketManagement } from '@/hooks/useTicketManagement';
import { useCustomerCustomData } from '@/hooks/useCustomerCustomData';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EquipmentManagerProps {
  customerId: string;
}

const getBookInPriority = (status: string): 'low' | 'medium' | 'high' | 'urgent' => {
  switch (status) {
    case 'broken': return 'urgent';
    case 'maintenance': return 'high';
    default: return 'low';
  }
};

const EquipmentManager = ({ customerId }: EquipmentManagerProps) => {
  const {
    equipment,
    serviceHistory,
    loading,
    savingService,
    saveEquipment,
    deleteEquipment,
    logService,
    loadServiceHistory
  } = useEquipmentService(customerId);

  const { handleCreateTicket } = useTicketManagement();
  const { appliedTemplates } = useCustomerCustomData(customerId);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [loggingServiceFor, setLoggingServiceFor] = useState<Equipment | null>(null);
  const [quickViewEquipment, setQuickViewEquipment] = useState<Equipment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const stats = {
    total: equipment.length,
    active: equipment.filter(e => e.status === 'active').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
    broken: equipment.filter(e => e.status === 'broken').length
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await deleteEquipment(deletingId);
    setDeletingId(null);
  };

  // Auto-load service history when expanding a card
  const handleToggleExpand = useCallback((equipmentId: string) => {
    const isExpanding = expandedId !== equipmentId;
    setExpandedId(isExpanding ? equipmentId : null);
    if (isExpanding) {
      loadServiceHistory(equipmentId);
    }
  }, [expandedId, loadServiceHistory]);

  // Industry-aware equipment type options
  const getEquipmentTypes = (): { value: string; label: string }[] => {
    const industry = appliedTemplates?.[0]?.industry?.toLowerCase() || '';
    
    if (industry.includes('print') || industry.includes('copier') || industry.includes('office')) {
      return [
        { value: 'printer', label: 'Printer' },
        { value: 'copier', label: 'Copier' },
        { value: 'scanner', label: 'Scanner' },
        { value: 'multifunction', label: 'Multifunction' },
        { value: 'fax', label: 'Fax Machine' },
        { value: 'plotter', label: 'Plotter' },
        { value: 'other', label: 'Other' },
      ];
    }
    if (industry.includes('hvac') || industry.includes('climate') || industry.includes('air')) {
      return [
        { value: 'air_conditioner', label: 'Air Conditioner' },
        { value: 'heat_pump', label: 'Heat Pump' },
        { value: 'furnace', label: 'Furnace' },
        { value: 'ventilation', label: 'Ventilation Unit' },
        { value: 'thermostat', label: 'Thermostat' },
        { value: 'other', label: 'Other' },
      ];
    }
    if (industry.includes('it') || industry.includes('tech') || industry.includes('computer')) {
      return [
        { value: 'computer', label: 'Computer' },
        { value: 'server', label: 'Server' },
        { value: 'network', label: 'Network Device' },
        { value: 'printer', label: 'Printer' },
        { value: 'monitor', label: 'Monitor' },
        { value: 'ups', label: 'UPS' },
        { value: 'other', label: 'Other' },
      ];
    }
    return [
      { value: 'printer', label: 'Printer' },
      { value: 'scanner', label: 'Scanner' },
      { value: 'copier', label: 'Copier' },
      { value: 'computer', label: 'Computer' },
      { value: 'multifunction', label: 'Multifunction' },
      { value: 'fax', label: 'Fax Machine' },
      { value: 'other', label: 'Other' },
    ];
  };

  const handleSaveEquipment = async (formData: EquipmentFormData, editingId?: string): Promise<boolean> => {
    const success = await saveEquipment(formData, editingId);
    
    // Auto-create ticket on new equipment book-in (not edits)
    if (success && !editingId) {
      const industry = appliedTemplates?.[0]?.industry || 'General';
      const category = `Equipment Book-In (${industry})`;
      
      try {
        await handleCreateTicket(customerId, {
          subject: `Equipment Book-In: ${formData.brand} ${formData.model}`,
          description: `New equipment booked in.\nType: ${formData.equipment_type}\nSerial: ${formData.serial_number || 'N/A'}\n${formData.technical_issues ? `Issues: ${formData.technical_issues}` : ''}`.trim(),
          priority: getBookInPriority(formData.status),
          status: 'open',
          timeEntries: [],
          totalTimeSpent: 0,
          category,
        });
        toast({
          title: "Equipment Booked In",
          description: `${formData.brand} ${formData.model} added and a service ticket has been created automatically.`,
        });
      } catch (error) {
        console.error('Auto-ticket creation failed (equipment saved successfully):', error);
        toast({
          title: "Equipment Added",
          description: `${formData.brand} ${formData.model} saved, but auto-ticket creation failed. You can create a ticket manually.`,
          variant: "destructive"
        });
      }
    }
    
    return success;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-8 w-28" />
        </div>
        {[1, 2].map(i => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
            <Printer className="h-4 w-4 text-primary" />
            Equipment
          </h3>
          {equipment.length > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {stats.total} total · {stats.active} active
              {stats.maintenance > 0 && ` · ${stats.maintenance} maintenance`}
              {stats.broken > 0 && ` · ${stats.broken} issues`}
            </p>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowAddDialog(true)} className="h-8 text-foreground border-border">
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add
        </Button>
      </div>

      {/* Equipment List */}
      {equipment.length === 0 ? (
        <Card className="border-dashed border border-border bg-muted/20">
          <CardContent className="py-8 text-center">
            <div className="p-3 rounded-full bg-muted inline-flex mb-3">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No Equipment</p>
            <p className="text-xs text-muted-foreground mb-4">
              Track printers, copiers, and other devices.
            </p>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Equipment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {equipment.map(eq => (
            <EquipmentCard
              key={eq.id}
              equipment={eq}
              isExpanded={expandedId === eq.id}
              onToggleExpand={() => handleToggleExpand(eq.id)}
              onEdit={() => setEditingEquipment(eq)}
              onDelete={() => setDeletingId(eq.id)}
              onLogService={() => setLoggingServiceFor(eq)}
              onViewHistory={() => setQuickViewEquipment(eq)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Equipment</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this equipment and all its service history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-foreground">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add/Edit Equipment Dialog */}
      <EquipmentFormDialog
        equipment={editingEquipment}
        isOpen={showAddDialog || !!editingEquipment}
        onClose={() => {
          setShowAddDialog(false);
          setEditingEquipment(null);
        }}
        onSave={handleSaveEquipment}
        equipmentTypes={getEquipmentTypes()}
      />

      {/* Log Service Dialog */}
      <LogServiceDialog
        equipment={loggingServiceFor}
        isOpen={!!loggingServiceFor}
        onClose={() => setLoggingServiceFor(null)}
        onSave={logService}
        saving={savingService}
      />

      {/* Equipment Quick View */}
      <EquipmentQuickView
        equipment={quickViewEquipment}
        serviceHistory={quickViewEquipment ? (serviceHistory[quickViewEquipment.id] || []) : []}
        isOpen={!!quickViewEquipment}
        onClose={() => setQuickViewEquipment(null)}
        onEdit={() => {
          if (quickViewEquipment) {
            setEditingEquipment(quickViewEquipment);
            setQuickViewEquipment(null);
          }
        }}
        onLogService={() => {
          if (quickViewEquipment) {
            setLoggingServiceFor(quickViewEquipment);
            setQuickViewEquipment(null);
          }
        }}
        onLoadHistory={loadServiceHistory}
      />
    </div>
  );
};

export default EquipmentManager;
