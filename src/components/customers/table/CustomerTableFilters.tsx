
import React, { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { FilterPreset } from '@/hooks/useCustomerFilters';

// Lazy load the enhanced filters for better performance
const EnhancedFilters = lazy(() => import('../filters/EnhancedFilters'));

interface CustomerTableFiltersProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  dateRange: { start: Date | null; end: Date | null };
  onDateRangeChange: (range: { start: Date | null; end: Date | null }) => void;
  ticketCountFilter: string;
  onTicketCountFilterChange: (filter: string) => void;
  savedPresets: FilterPreset[];
  onApplyPreset: (preset: FilterPreset) => void;
  onSavePreset: (name: string) => void;
  onQuickDateRange: (range: string) => void;
}

const CustomerTableFilters = (props: CustomerTableFiltersProps) => {
  const FiltersSkeleton = React.memo(() => (
    <div 
      className="p-6 bg-white border rounded-lg shadow-md animate-pulse"
      role="status"
      aria-label="Loading filters"
    >
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-[300px]" />
            <Skeleton className="h-10 w-[180px]" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
      <span className="sr-only">Loading customer filters...</span>
    </div>
  ));

  return (
    <div role="search" aria-label="Customer filters">
      <Suspense fallback={<FiltersSkeleton />}>
        <EnhancedFilters
          searchQuery={props.searchQuery}
          onSearchQueryChange={props.onSearchQueryChange}
          statusFilter={props.statusFilter}
          onStatusFilterChange={props.onStatusFilterChange}
          dateRange={props.dateRange}
          onDateRangeChange={props.onDateRangeChange}
          ticketFilter={props.ticketCountFilter}
          onTicketFilterChange={props.onTicketCountFilterChange}
          savedPresets={props.savedPresets}
          onApplyPreset={props.onApplyPreset}
          onSavePreset={props.onSavePreset}
          onQuickDateRange={props.onQuickDateRange}
        />
      </Suspense>
    </div>
  );
};

export default CustomerTableFilters;
