
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';

interface DateRangeFilterProps {
  dateRange: { start: Date | null; end: Date | null };
  onDateRangeChange: (range: { start: Date | null; end: Date | null }) => void;
}

const DateRangeFilter = ({ dateRange, onDateRangeChange }: DateRangeFilterProps) => {
  const handleDateRangeSelect = React.useCallback((field: 'start' | 'end', date: Date | undefined) => {
    onDateRangeChange({
      ...dateRange,
      [field]: date || null
    });
  }, [dateRange, onDateRangeChange]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">Date Range</label>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="flex-1 justify-start text-left font-normal border-slate-300 hover:bg-slate-50"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.start ? formatDate(dateRange.start) : 'Start'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateRange.start || undefined}
              onSelect={(date) => handleDateRangeSelect('start', date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="flex-1 justify-start text-left font-normal border-slate-300 hover:bg-slate-50"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.end ? formatDate(dateRange.end) : 'End'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateRange.end || undefined}
              onSelect={(date) => handleDateRangeSelect('end', date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default DateRangeFilter;
