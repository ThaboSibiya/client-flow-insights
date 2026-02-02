import React, { useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Printer, 
  Edit3, 
  Wrench, 
  History,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  Settings,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Equipment, ServiceHistoryEntry } from './types';
import ServiceHistoryTimeline from './ServiceHistoryTimeline';
import { format, isPast } from 'date-fns';

interface EquipmentQuickViewProps {
  equipment: Equipment | null;
  serviceHistory: ServiceHistoryEntry[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onLogService: () => void;
  onLoadHistory: (equipmentId: string) => void;
  loadingHistory?: boolean;
}

const statusConfig = {
  active: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Active' },
  maintenance: { icon: Settings, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Maintenance' },
  broken: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', label: 'Broken' },
  retired: { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Retired' }
};

const EquipmentQuickView = ({
  equipment,
  serviceHistory,
  isOpen,
  onClose,
  onEdit,
  onLogService,
  onLoadHistory,
  loadingHistory
}: EquipmentQuickViewProps) => {
  useEffect(() => {
    if (isOpen && equipment) {
      onLoadHistory(equipment.id);
    }
  }, [isOpen, equipment?.id]);

  if (!equipment) return null;

  const status = statusConfig[equipment.status] || statusConfig.active;
  const StatusIcon = status.icon;
  const warrantyExpired = equipment.warranty_expiry && isPast(new Date(equipment.warranty_expiry));

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg p-0">
        <SheetHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-3 rounded-xl", status.bg)}>
                <Printer className={cn("h-6 w-6", status.color)} />
              </div>
              <div>
                <SheetTitle className="text-lg">
                  {equipment.brand} {equipment.model}
                </SheetTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={cn("text-xs", status.bg, status.color)}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground">
                    S/N: {equipment.serial_number || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={onLogService} className="flex-1">
              <Wrench className="h-4 w-4 mr-2" />
              Log Service
            </Button>
            <Button variant="outline" onClick={onEdit}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </SheetHeader>

        <Tabs defaultValue="details" className="flex-1">
          <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-6 h-11">
            <TabsTrigger 
              value="details" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Details
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              <History className="h-4 w-4 mr-1" />
              Service History ({serviceHistory.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-0 p-6">
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="space-y-6">
                {/* Equipment Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Type</span>
                    <p className="font-medium capitalize">{equipment.equipment_type}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Total Services</span>
                    <p className="font-medium">{equipment.total_services}</p>
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Important Dates
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {equipment.purchase_date && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Calendar className="h-4 w-4" />
                          Purchase Date
                        </div>
                        <p className="font-medium">
                          {format(new Date(equipment.purchase_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    )}
                    {equipment.warranty_expiry && (
                      <div className={cn(
                        "p-3 rounded-lg",
                        warrantyExpired ? "bg-red-50" : "bg-muted/50"
                      )}>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Shield className="h-4 w-4" />
                          Warranty
                        </div>
                        <p className={cn("font-medium", warrantyExpired && "text-red-600")}>
                          {format(new Date(equipment.warranty_expiry), 'MMM dd, yyyy')}
                          {warrantyExpired && ' (Expired)'}
                        </p>
                      </div>
                    )}
                    {equipment.last_service_date && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Wrench className="h-4 w-4" />
                          Last Service
                        </div>
                        <p className="font-medium">
                          {format(new Date(equipment.last_service_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    )}
                    {equipment.next_service_due && (
                      <div className={cn(
                        "p-3 rounded-lg",
                        isPast(new Date(equipment.next_service_due)) ? "bg-orange-50" : "bg-muted/50"
                      )}>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Clock className="h-4 w-4" />
                          Next Service Due
                        </div>
                        <p className={cn(
                          "font-medium",
                          isPast(new Date(equipment.next_service_due)) && "text-orange-600"
                        )}>
                          {format(new Date(equipment.next_service_due), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Technical Issues */}
                {equipment.technical_issues && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Technical Issues
                    </h4>
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-2 text-amber-800 mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">Known Issues</span>
                      </div>
                      <p className="text-sm text-amber-700">{equipment.technical_issues}</p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {equipment.notes && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Notes
                    </h4>
                    <p className="text-sm text-foreground">{equipment.notes}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" className="mt-0 p-6">
            <ServiceHistoryTimeline 
              history={serviceHistory}
              onLogService={onLogService}
              loading={loadingHistory}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default EquipmentQuickView;
