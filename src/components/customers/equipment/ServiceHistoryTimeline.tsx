import React from 'react';
import { 
  Wrench, 
  Settings, 
  Search, 
  Package, 
  RefreshCw,
  Calendar,
  User,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ServiceHistoryEntry } from './types';
import { format } from 'date-fns';

interface ServiceHistoryTimelineProps {
  history: ServiceHistoryEntry[];
  onLogService: () => void;
  loading?: boolean;
}

const serviceTypeConfig = {
  maintenance: { icon: Settings, color: 'text-blue-600', bg: 'bg-blue-100' },
  repair: { icon: Wrench, color: 'text-red-600', bg: 'bg-red-100' },
  inspection: { icon: Search, color: 'text-amber-600', bg: 'bg-amber-100' },
  installation: { icon: Package, color: 'text-green-600', bg: 'bg-green-100' },
  replacement: { icon: RefreshCw, color: 'text-purple-600', bg: 'bg-purple-100' }
};

const statusConfig = {
  completed: { icon: CheckCircle, color: 'text-green-600', label: 'Completed' },
  in_progress: { icon: Clock, color: 'text-blue-600', label: 'In Progress' },
  scheduled: { icon: Calendar, color: 'text-amber-600', label: 'Scheduled' },
  cancelled: { icon: XCircle, color: 'text-muted-foreground', label: 'Cancelled' }
};

const ServiceHistoryTimeline = ({ history, onLogService, loading }: ServiceHistoryTimelineProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="p-4 rounded-full bg-muted inline-flex mb-4">
          <Wrench className="h-8 w-8 text-muted-foreground" />
        </div>
        <h4 className="font-medium text-foreground mb-2">No Service History</h4>
        <p className="text-sm text-muted-foreground mb-4">
          This equipment has no recorded service history yet.
        </p>
        <Button onClick={onLogService} variant="outline">
          <Wrench className="h-4 w-4 mr-2" />
          Log First Service
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-4">
          {history.map((entry, index) => {
            const typeConfig = serviceTypeConfig[entry.service_type] || serviceTypeConfig.maintenance;
            const TypeIcon = typeConfig.icon;
            const status = statusConfig[entry.status] || statusConfig.completed;
            const StatusIcon = status.icon;

            return (
              <div key={entry.id} className="relative pl-12">
                {/* Timeline dot */}
                <div className={cn(
                  "absolute left-0 p-2 rounded-full border-2 border-background shadow-sm",
                  typeConfig.bg
                )}>
                  <TypeIcon className={cn("h-4 w-4", typeConfig.color)} />
                </div>

                {/* Content card */}
                <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium capitalize text-foreground">
                          {entry.service_type}
                        </span>
                        <Badge variant="outline" className={cn("text-xs", status.color)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(entry.service_date), 'MMM dd, yyyy')}
                        </span>
                        {entry.performed_by && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {entry.performed_by}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {entry.total_cost > 0 && (
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                          <DollarSign className="h-4 w-4" />
                          {entry.total_cost.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Labor: ${entry.labor_cost} | Parts: ${entry.parts_cost}
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-foreground mb-2">{entry.description}</p>

                  {entry.resolution && (
                    <div className="bg-green-50 border border-green-200 rounded p-2 mb-2">
                      <span className="text-xs font-medium text-green-800">Resolution:</span>
                      <p className="text-sm text-green-700">{entry.resolution}</p>
                    </div>
                  )}

                  {entry.parts_used && entry.parts_used.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap mt-2">
                      <span className="text-xs text-muted-foreground">Parts:</span>
                      {entry.parts_used.map((part, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {part}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {entry.next_service_due && (
                    <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                      <AlertCircle className="h-3 w-3" />
                      Next service due: {format(new Date(entry.next_service_due), 'MMM dd, yyyy')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
};

export default ServiceHistoryTimeline;
