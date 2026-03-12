import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';
import { CustomerStatus } from '@/types/customer';
import { cn } from '@/lib/utils';

interface StatusChangeVisualProps {
  currentStatus: CustomerStatus;
  newStatus: CustomerStatus;
  onChange: (value: CustomerStatus) => void;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  existing: { label: 'Existing', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  finalised: { label: 'Finalised', className: 'bg-primary/10 text-primary border-primary/20' },
};

export const StatusChangeVisual = ({ currentStatus, newStatus, onChange }: StatusChangeVisualProps) => {
  const current = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.new;
  const isChanged = currentStatus !== newStatus;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Status Update</label>
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Current</span>
          <Badge variant="outline" className={cn('text-xs', current.className)}>
            {current.label}
          </Badge>
        </div>
        
        <ArrowRight className={cn(
          'h-4 w-4 shrink-0 transition-colors',
          isChanged ? 'text-primary' : 'text-muted-foreground/40'
        )} />
        
        <div className="flex flex-col items-center gap-1 flex-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">New</span>
          <Select value={newStatus} onValueChange={(v: CustomerStatus) => onChange(v)}>
            <SelectTrigger className="h-7 text-xs w-full max-w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="existing">Existing</SelectItem>
              <SelectItem value="finalised">Finalised</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
