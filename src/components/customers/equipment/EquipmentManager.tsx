import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Printer, CheckCircle, AlertTriangle, Settings, Package } from 'lucide-react';
import { useEquipmentService } from '@/hooks/useEquipmentService';
import { Equipment } from './types';
import EquipmentCard from './EquipmentCard';
import EquipmentFormDialog from './EquipmentFormDialog';
import LogServiceDialog from './LogServiceDialog';
import EquipmentQuickView from './EquipmentQuickView';
import { Skeleton } from '@/components/ui/skeleton';

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

  // Stats
  const stats = {
    total: equipment.length,
    active: equipment.filter(e => e.status === 'active').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length,
    broken: equipment.filter(e => e.status === 'broken').length
  };

  const handleEdit = (eq: Equipment) => {
    setEditingEquipment(eq);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      await deleteEquipment(id);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        {[1, 2].map(i => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Printer className="h-5 w-5 text-primary" />
            Equipment Management
          </h3>
          <p className="text-sm text-muted-foreground">
            {equipment.length} equipment items registered
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Equipment
        </Button>
      </div>

      {/* Stats Overview */}
      {equipment.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Equipment</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Settings className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.maintenance}</p>
                <p className="text-xs text-muted-foreground">Maintenance</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.broken}</p>
                <p className="text-xs text-muted-foreground">Issues</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Equipment List */}
      {equipment.length === 0 ? (
        <Card className="border-dashed border-2 border-border bg-muted/30">
          <CardContent className="py-12 text-center">
            <div className="p-4 rounded-full bg-muted inline-flex mb-4">
              <Printer className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Equipment Registered</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Add equipment to track printers, copiers, and other devices. 
              Log service history and maintenance records.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Equipment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {equipment.map(eq => (
            <EquipmentCard
              key={eq.id}
              equipment={eq}
              isExpanded={expandedId === eq.id}
              onToggleExpand={() => setExpandedId(expandedId === eq.id ? null : eq.id)}
              onEdit={() => handleEdit(eq)}
              onDelete={() => handleDelete(eq.id)}
              onLogService={() => setLoggingServiceFor(eq)}
              onViewHistory={() => setQuickViewEquipment(eq)}
            />
          ))}
        </div>
      )}

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
