
import React from 'react';
import { CalendarIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TimeframeSelectorProps {
  timeframe: 'monthly' | 'yearly';
  setTimeframe: (timeframe: 'monthly' | 'yearly') => void;
}

const TimeframeSelector = ({ timeframe, setTimeframe }: TimeframeSelectorProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
        <CalendarIcon className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium">{timeframe === 'monthly' ? 'Monthly' : 'Yearly'}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-32" align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => setTimeframe('monthly')}>
            Monthly
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTimeframe('yearly')}>
            Yearly
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TimeframeSelector;
