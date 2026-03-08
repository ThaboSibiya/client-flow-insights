
import React from 'react';
import { CustomerStatus } from '@/context/CRMContext';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusSelectorProps {
  status: CustomerStatus;
  onChange: (value: CustomerStatus) => void;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; dotClass: string; badgeClass: string }> = {
  new: {
    label: 'New',
    dotClass: 'bg-primary',
    badgeClass: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15',
  },
  existing: {
    label: 'Existing',
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15',
  },
  pending: {
    label: 'Pending',
    dotClass: 'bg-amber-500',
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/15',
  },
  finalised: {
    label: 'Finalised',
    dotClass: 'bg-violet-500',
    badgeClass: 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20 hover:bg-violet-500/15',
  },
};

const StatusSelector = ({ status, onChange, className }: StatusSelectorProps) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.new;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
            config.badgeClass,
            className
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', config.dotClass)} />
          {config.label}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-32">
        {Object.entries(STATUS_CONFIG).map(([value, cfg]) => (
          <DropdownMenuItem
            key={value}
            onClick={() => onChange(value as CustomerStatus)}
            className="text-xs cursor-pointer"
          >
            <span className={cn('h-2 w-2 rounded-full mr-2', cfg.dotClass)} />
            {cfg.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusSelector;
