
import React, { Suspense, lazy, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, RefreshCw, Filter } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

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
  const isMobile = useIsMobile();
  const [isFilterSheetOpen, setIsFilterSheetOpen] = React.useState(false);

  const FiltersSkeleton = React.memo(() => (
    <div 
      className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm animate-pulse"
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

  const MobileQuickActionsBar = React.memo(() => (
    <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-lg border border-slate-200">
      <div className="flex items-center gap-3">
        <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 touch-target h-11 px-4"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Customer Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
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
          </SheetContent>
        </Sheet>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={props.onClearAllFilters}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 touch-target h-11 px-3"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
      
      {props.onRefresh && (
        <Button
          variant="outline"
          size="sm"
          onClick={props.onRefresh}
          disabled={props.isRefreshing}
          className="flex items-center gap-2 touch-target h-11 px-4"
        >
          <RefreshCw className={`h-4 w-4 ${props.isRefreshing ? 'animate-spin' : ''}`} />
          {props.isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      )}
    </div>
  ));

  const DesktopQuickActionsBar = React.memo(() => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold text-slate-900">Customer Filters</h2>
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
              {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={props.onClearAllFilters}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-3"
            >
              <X className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
        )}
      </div>
      
      {props.onRefresh && (
        <Button
          variant="outline"
          size="sm"
          onClick={props.onRefresh}
          disabled={props.isRefreshing}
          className="flex items-center gap-2 border-slate-300 hover:bg-slate-50"
        >
          <RefreshCw className={`h-4 w-4 ${props.isRefreshing ? 'animate-spin' : ''}`} />
          {props.isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      )}
    </div>
  ));

  if (isMobile) {
    return (
      <div role="search" aria-label="Customer filters" className="space-y-4">
        <MobileQuickActionsBar />
      </div>
    );
  }

  return (
    <div role="search" aria-label="Customer filters" className="space-y-6">
      <DesktopQuickActionsBar />
      
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
