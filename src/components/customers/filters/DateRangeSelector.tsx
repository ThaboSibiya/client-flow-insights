
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface DateRangeSelectorProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

const DateRangeSelector = ({ dateRange, onDateRangeChange }: DateRangeSelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="h-9 justify-start text-left font-normal border-quikle-silver/30 text-quikle-slate hover:bg-quikle-crystal/50"
          >
            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
            {dateRange.start ? format(dateRange.start, 'MMM d') : 'Start date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white border-quikle-silver/20 z-50" align="start">
          <Calendar
            mode="single"
            selected={dateRange.start || undefined}
            onSelect={(date) => onDateRangeChange({ ...dateRange, start: date || null })}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
      <span className="text-quikle-slate/60 text-sm">→</span>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="h-9 justify-start text-left font-normal border-quikle-silver/30 text-quikle-slate hover:bg-quikle-crystal/50"
          >
            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
            {dateRange.end ? format(dateRange.end, 'MMM d') : 'End date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white border-quikle-silver/20 z-50" align="start">
          <Calendar
            mode="single"
            selected={dateRange.end || undefined}
            onSelect={(date) => onDateRangeChange({ ...dateRange, end: date || null })}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
      {(dateRange.start || dateRange.end) && (
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={() => onDateRangeChange({ start: null, end: null })}
          className="h-8 w-8 p-0 text-quikle-slate hover:text-red-600 hover:bg-red-50"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
};

export default DateRangeSelector;
