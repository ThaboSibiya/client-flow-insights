
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface QuickFiltersProps {
  onQuickDateRange: (range: string) => void;
}

const QuickFilters = ({ onQuickDateRange }: QuickFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="text-sm font-medium text-quikle-charcoal mr-2">Quick filters:</span>
      {['today', 'week', 'month', 'quarter'].map((range) => (
        <Button
          key={range}
          variant="outline"
          size="sm"
          onClick={() => onQuickDateRange(range)}
          className="capitalize border-quikle-silver/50 text-quikle-slate hover:bg-quikle-crystal hover:text-quikle-primary"
        >
          <Clock className="h-3 w-3 mr-1" />
          {range === 'week' ? 'This Week' : 
           range === 'month' ? 'This Month' : 
           range === 'quarter' ? 'This Quarter' : 'Today'}
        </Button>
      ))}
    </div>
  );
};

export default QuickFilters;
