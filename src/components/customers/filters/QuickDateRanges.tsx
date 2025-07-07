
import React from 'react';
import { Button } from '@/components/ui/button';

interface QuickDateRangesProps {
  dateRange: { start: Date | null; end: Date | null };
  onQuickDateRange: (range: string) => void;
  onClearDates: () => void;
}

const QuickDateRanges = ({ dateRange, onQuickDateRange, onClearDates }: QuickDateRangesProps) => {
  const quickDateRanges = React.useMemo(() => [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 days', value: 'week' },
    { label: 'This month', value: 'month' },
    { label: 'This quarter', value: 'quarter' },
  ], []);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-700">Quick Date Ranges</label>
      <div className="flex flex-wrap gap-2">
        {quickDateRanges.map((range) => (
          <Button
            key={range.value}
            variant="outline"
            size="sm"
            onClick={() => onQuickDateRange(range.value)}
            className="text-xs border-slate-300 hover:bg-slate-50"
          >
            {range.label}
          </Button>
        ))}
        {(dateRange.start || dateRange.end) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearDates} 
            className="text-xs text-red-600 hover:bg-red-50"
          >
            Clear dates
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuickDateRanges;
