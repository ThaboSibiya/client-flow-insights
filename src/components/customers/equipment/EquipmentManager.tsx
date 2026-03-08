import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Printer, Package } from 'lucide-react';
import { useEquipmentService } from '@/hooks/useEquipmentService';
import { Equipment } from './types';
import EquipmentCard from './EquipmentCard';
import EquipmentFormDialog from './EquipmentFormDialog';
import LogServiceDialog from './LogServiceDialog';
import EquipmentQuickView from './EquipmentQuickView';
import { Skeleton } from '@/components/ui/skeleton';
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
              onToggleExpand={() => setExpandedId(expandedId === eq.id ? null : eq.id)}
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
        onSave={saveEquipment}
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
