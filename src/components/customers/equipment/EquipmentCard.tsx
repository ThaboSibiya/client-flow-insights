import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Printer, 
  Edit3, 
  Trash2, 
  ChevronDown,
  ChevronUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Settings,
  Wrench,
  Clock,
  Shield,
  MoreVertical,
  Ticket
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Equipment } from './types';
import { format, isPast, differenceInDays } from 'date-fns';

interface EquipmentCardProps {
  equipment: Equipment;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onLogService: () => void;
  onViewHistory: () => void;
  linkedTicketCount?: number;
  onViewTickets?: () => void;
}

const statusConfig: Record<string, { icon: React.ElementType; classes: string; label: string }> = {
  active: { icon: CheckCircle, classes: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30', label: 'Active' },
  maintenance: { icon: Settings, classes: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30', label: 'Maintenance' },
  broken: { icon: AlertTriangle, classes: 'bg-destructive/10 text-destructive border-destructive/30', label: 'Broken' },
  retired: { icon: Clock, classes: 'bg-muted text-muted-foreground border-border', label: 'Retired' }
};

const EquipmentCard = ({
  equipment,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onLogService,
  onViewHistory,
  linkedTicketCount = 0,
  onViewTickets
}: EquipmentCardProps) => {
  const status = statusConfig[equipment.status] || statusConfig.active;
  const StatusIcon = status.icon;
  
  const warrantyExpired = equipment.warranty_expiry && isPast(new Date(equipment.warranty_expiry));
  const warrantyDaysLeft = equipment.warranty_expiry 
    ? differenceInDays(new Date(equipment.warranty_expiry), new Date())
    : null;

  const serviceDue = equipment.next_service_due && isPast(new Date(equipment.next_service_due));

  return (
    <Card className={cn(
      "transition-all duration-200 border group",
      isExpanded ? "ring-1 ring-primary/20 border-primary/30" : "border-border hover:border-primary/20"
    )}>
      <CardContent className="p-0">
        {/* Main Row */}
        <div className="flex items-center gap-3 p-3">
          {/* Icon */}
          <div className={cn("p-2 rounded-lg border", status.classes)}>
            <Printer className="h-4 w-4" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0" onClick={onToggleExpand} role="button" tabIndex={0}>
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="font-medium text-sm text-foreground truncate">
                {equipment.brand} {equipment.model}
              </h4>
              <Badge variant="outline" className={cn("text-[10px] shrink-0 border", status.classes)}>
                <StatusIcon className="h-2.5 w-2.5 mr-0.5" />
                {status.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono bg-muted px-1 py-0.5 rounded text-[10px]">
                {equipment.serial_number || 'No S/N'}
              </span>
              <span className="capitalize">{equipment.equipment_type}</span>
              {equipment.total_services > 0 && (
                <span className="flex items-center gap-0.5">
                  <Wrench className="h-3 w-3" />
                  {equipment.total_services}
                </span>
              )}
              {linkedTicketCount > 0 && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onViewTickets?.(); }}
                  className="flex items-center gap-0.5 text-primary hover:underline"
                >
                  <Ticket className="h-3 w-3" />
                  {linkedTicketCount}
                </button>
              )}
            </div>
          </div>

          {/* Indicators */}
          <div className="hidden sm:flex items-center gap-1.5">
            {warrantyDaysLeft !== null && warrantyDaysLeft <= 30 && warrantyDaysLeft > 0 && (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px]">
                <Shield className="h-2.5 w-2.5 mr-0.5" />
                {warrantyDaysLeft}d
              </Badge>
            )}
            {warrantyExpired && (
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-[10px]">
                <Shield className="h-2.5 w-2.5 mr-0.5" />
                Expired
              </Badge>
            )}
            {serviceDue && (
              <Badge variant="outline" className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30 text-[10px]">
                <Wrench className="h-2.5 w-2.5 mr-0.5" />
                Due
              </Badge>
            )}
          </div>

          {/* Desktop hover actions */}
          <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={onLogService} className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10">
              <Wrench className="h-3.5 w-3.5 mr-1" />
              Service
            </Button>
            <Button variant="ghost" size="sm" onClick={onEdit} className="h-7 w-7 p-0">
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Mobile overflow menu */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onLogService}>
                  <Wrench className="h-4 w-4 mr-2" />
                  Log Service
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onViewHistory}>
                  <Clock className="h-4 w-4 mr-2" />
                  Service History
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Expand Button */}
          <Button variant="ghost" size="sm" onClick={onToggleExpand} className="h-7 w-7 p-0 hidden sm:flex">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Mobile indicators row */}
        <div className="sm:hidden flex items-center gap-1.5 px-3 pb-2">
          {warrantyDaysLeft !== null && warrantyDaysLeft <= 30 && warrantyDaysLeft > 0 && (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[10px]">
              <Shield className="h-2.5 w-2.5 mr-0.5" />
              {warrantyDaysLeft}d warranty
            </Badge>
          )}
          {warrantyExpired && (
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-[10px]">
              Expired warranty
            </Badge>
          )}
          {serviceDue && (
            <Badge variant="outline" className="bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30 text-[10px]">
              Service Due
            </Badge>
          )}
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-border bg-muted/30 p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
              {equipment.purchase_date && (
                <div>
                  <span className="text-muted-foreground flex items-center gap-1 mb-0.5 text-xs">
                    <Calendar className="h-3 w-3" />
                    Purchase
                  </span>
                  <p className="font-medium text-foreground text-xs">{format(new Date(equipment.purchase_date), 'MMM dd, yyyy')}</p>
                </div>
              )}
              {equipment.warranty_expiry && (
                <div>
                  <span className="text-muted-foreground flex items-center gap-1 mb-0.5 text-xs">
                    <Shield className="h-3 w-3" />
                    Warranty
                  </span>
                  <p className={cn("font-medium text-xs", warrantyExpired ? "text-destructive" : "text-foreground")}>
                    {format(new Date(equipment.warranty_expiry), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
              {equipment.last_service_date && (
                <div>
                  <span className="text-muted-foreground flex items-center gap-1 mb-0.5 text-xs">
                    <Wrench className="h-3 w-3" />
                    Last Service
                  </span>
                  <p className="font-medium text-foreground text-xs">{format(new Date(equipment.last_service_date), 'MMM dd, yyyy')}</p>
                </div>
              )}
              {equipment.next_service_due && (
                <div>
                  <span className="text-muted-foreground flex items-center gap-1 mb-0.5 text-xs">
                    <Clock className="h-3 w-3" />
                    Next Service
                  </span>
                  <p className={cn("font-medium text-xs", serviceDue ? "text-orange-600 dark:text-orange-400" : "text-foreground")}>
                    {format(new Date(equipment.next_service_due), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
            </div>

            {equipment.technical_issues && (
              <div className="mb-3 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <span className="font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-0.5 text-xs">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Technical Issues
                </span>
                <p className="text-amber-700 dark:text-amber-300 text-xs">{equipment.technical_issues}</p>
              </div>
            )}

            {equipment.notes && (
              <div className="text-xs">
                <span className="font-medium text-muted-foreground">Notes:</span>
                <p className="mt-0.5 text-foreground">{equipment.notes}</p>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-border flex justify-end">
              <Button variant="outline" size="sm" onClick={onViewHistory} className="h-7 text-xs">
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                Service History
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentCard;
