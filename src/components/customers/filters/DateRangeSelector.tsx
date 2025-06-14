
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
      <span className="text-sm font-medium text-quikle-charcoal min-w-fit">Created:</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[140px] justify-start text-left font-normal border-quikle-silver/50 text-quikle-slate hover:bg-quikle-crystal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.start ? format(dateRange.start, 'MMM dd') : 'From'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white border-quikle-silver/30 z-50">
          <Calendar
            mode="single"
            selected={dateRange.start || undefined}
            onSelect={(date) => onDateRangeChange({ ...dateRange, start: date || null })}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
      <span className="text-quikle-slate">to</span>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[140px] justify-start text-left font-normal border-quikle-silver/50 text-quikle-slate hover:bg-quikle-crystal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.end ? format(dateRange.end, 'MMM dd') : 'To'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white border-quikle-silver/30 z-50">
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
          className="text-quikle-slate hover:text-red-600 hover:bg-red-50"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default DateRangeSelector;
