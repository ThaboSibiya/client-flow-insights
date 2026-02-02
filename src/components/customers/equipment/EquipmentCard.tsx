import React, { useState } from 'react';
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
  Shield
} from 'lucide-react';
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
}

const statusConfig = {
  active: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 border-green-200', label: 'Active' },
  maintenance: { icon: Settings, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', label: 'Maintenance' },
  broken: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'Broken' },
  retired: { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted border-muted', label: 'Retired' }
};

const EquipmentCard = ({
  equipment,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onLogService,
  onViewHistory
}: EquipmentCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const status = statusConfig[equipment.status] || statusConfig.active;
  const StatusIcon = status.icon;
  
  const warrantyExpired = equipment.warranty_expiry && isPast(new Date(equipment.warranty_expiry));
  const warrantyDaysLeft = equipment.warranty_expiry 
    ? differenceInDays(new Date(equipment.warranty_expiry), new Date())
    : null;

  const serviceDue = equipment.next_service_due && isPast(new Date(equipment.next_service_due));

  return (
    <Card 
      className={cn(
        "transition-all duration-200 border",
        isHovered ? "shadow-md border-primary/30" : "shadow-sm border-border",
        isExpanded && "ring-1 ring-primary/20"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        {/* Main Row */}
        <div className="flex items-center gap-4 p-4">
          {/* Icon */}
          <div className={cn("p-2.5 rounded-lg", status.bg)}>
            <Printer className={cn("h-5 w-5", status.color)} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="font-medium text-foreground truncate">
                {equipment.brand} {equipment.model}
              </h4>
              <Badge variant="outline" className={cn("text-xs shrink-0", status.bg, status.color)}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                {equipment.serial_number || 'No S/N'}
              </span>
              <span className="capitalize">{equipment.equipment_type}</span>
              {equipment.total_services > 0 && (
                <span className="flex items-center gap-1">
                  <Wrench className="h-3 w-3" />
                  {equipment.total_services} service{equipment.total_services !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Indicators */}
          <div className="flex items-center gap-2">
            {warrantyDaysLeft !== null && warrantyDaysLeft <= 30 && warrantyDaysLeft > 0 && (
              <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 text-xs">
                <Shield className="h-3 w-3 mr-1" />
                {warrantyDaysLeft}d warranty
              </Badge>
            )}
            {warrantyExpired && (
              <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700 text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Expired
              </Badge>
            )}
            {serviceDue && (
              <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700 text-xs">
                <Wrench className="h-3 w-3 mr-1" />
                Service Due
              </Badge>
            )}
          </div>

          {/* Hover Actions */}
          <div className={cn(
            "flex items-center gap-1 transition-opacity",
            isHovered ? "opacity-100" : "opacity-0"
          )}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogService}
              className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10"
            >
              <Wrench className="h-4 w-4 mr-1" />
              Log Service
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 w-8 p-0"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Expand Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpand}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-border bg-muted/30 p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
              {equipment.purchase_date && (
                <div>
                  <span className="text-muted-foreground flex items-center gap-1 mb-1">
                    <Calendar className="h-3 w-3" />
                    Purchase Date
                  </span>
                  <p className="font-medium">{format(new Date(equipment.purchase_date), 'MMM dd, yyyy')}</p>
                </div>
              )}
              {equipment.warranty_expiry && (
                <div>
                  <span className="text-muted-foreground flex items-center gap-1 mb-1">
                    <Shield className="h-3 w-3" />
                    Warranty Expiry
                  </span>
                  <p className={cn("font-medium", warrantyExpired && "text-red-600")}>
                    {format(new Date(equipment.warranty_expiry), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
              {equipment.last_service_date && (
                <div>
                  <span className="text-muted-foreground flex items-center gap-1 mb-1">
                    <Wrench className="h-3 w-3" />
                    Last Service
                  </span>
                  <p className="font-medium">{format(new Date(equipment.last_service_date), 'MMM dd, yyyy')}</p>
                </div>
              )}
              {equipment.next_service_due && (
                <div>
                  <span className="text-muted-foreground flex items-center gap-1 mb-1">
                    <Clock className="h-3 w-3" />
                    Next Service
                  </span>
                  <p className={cn("font-medium", serviceDue && "text-orange-600")}>
                    {format(new Date(equipment.next_service_due), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
            </div>

            {equipment.technical_issues && (
              <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <span className="font-medium text-amber-800 flex items-center gap-2 mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  Technical Issues
                </span>
                <p className="text-amber-700 text-sm">{equipment.technical_issues}</p>
              </div>
            )}

            {equipment.notes && (
              <div className="text-sm">
                <span className="font-medium text-muted-foreground">Notes:</span>
                <p className="mt-1 text-foreground">{equipment.notes}</p>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-border flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={onViewHistory}
              >
                <Clock className="h-4 w-4 mr-2" />
                View Service History
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentCard;
