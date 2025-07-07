
import React, { Suspense, lazy, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, RefreshCw } from 'lucide-react';

const EnhancedFilters = lazy(() => import('../filters/EnhancedFilters'));

interface CustomerTableFiltersOptimizedProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  dateRange: { start: Date | null; end: Date | null };
  onDateRangeChange: (range: { start: Date | null; end: Date | null }) => void;
  ticketCountFilter: string;
  onTicketCountFilterChange: (filter: string) => void;
  savedPresets: any[];
  onApplyPreset: (preset: any) => void;
  onSavePreset: (name: string) => void;
  onQuickDateRange: (range: string) => void;
  activeFilters: string[];
  onClearAllFilters: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const CustomerTableFiltersOptimized = (props: CustomerTableFiltersOptimizedProps) => {
  const FiltersSkeleton = React.memo(() => (
    <div 
      className="p-6 bg-gradient-to-r from-white via-quikle-crystal to-quikle-platinum border border-quikle-silver/30 rounded-lg shadow-elegant animate-pulse"
      role="status"
      aria-label="Loading filters"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-[300px]" />
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-[180px]" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      <span className="sr-only">Loading customer filters...</span>
    </div>
  ));

  const activeFiltersCount = useMemo(() => 
    props.activeFilters.length, [props.activeFilters]
  );

  const QuickActionsBar = React.memo(() => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {activeFiltersCount > 0 && (
          <>
            <Badge variant="secondary" className="bg-quikle-primary/10 text-quikle-primary">
              {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={props.onClearAllFilters}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </>
        )}
      </div>
      
      {props.onRefresh && (
        <Button
          variant="outline"
          size="sm"
          onClick={props.onRefresh}
          disabled={props.isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-3 w-3 ${props.isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      )}
    </div>
  ));

  return (
    <div role="search" aria-label="Customer filters" className="space-y-4">
      <QuickActionsBar />
      
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

export default CustomerTableFiltersOptimized;
