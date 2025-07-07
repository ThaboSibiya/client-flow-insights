
import React from 'react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { FilterPreset } from '@/hooks/useCustomerFilters/types';
import QuickDateRanges from './QuickDateRanges';
import DateRangeFilter from './DateRangeFilter';
import FilterPresets from './FilterPresets';

interface EnhancedFiltersProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  dateRange: { start: Date | null; end: Date | null };
  onDateRangeChange: (range: { start: Date | null; end: Date | null }) => void;
  ticketFilter: string;
  onTicketFilterChange: (value: string) => void;
  savedPresets: FilterPreset[];
  onApplyPreset: (presetId: string) => void;
  onSavePreset: (name: string) => void;
  onQuickDateRange: (range: string) => void;
}

const EnhancedFilters = React.memo(({ 
  statusFilter, 
  onStatusFilterChange, 
  searchQuery, 
  onSearchQueryChange,
  dateRange,
  onDateRangeChange,
  ticketFilter,
  onTicketFilterChange,
  savedPresets,
  onApplyPreset,
  onSavePreset,
  onQuickDateRange
}: EnhancedFiltersProps) => {
  const clearDateRange = React.useCallback(() => {
    onDateRangeChange({ start: null, end: null });
  }, [onDateRangeChange]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-slate-600" />
          <h3 className="text-lg font-medium text-slate-900">Advanced Filters</h3>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Date Range Buttons */}
        <QuickDateRanges
          dateRange={dateRange}
          onQuickDateRange={onQuickDateRange}
          onClearDates={clearDateRange}
        />

        {/* Main Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="pl-10 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="existing">Existing</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="finalised">Finalised</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ticket Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tickets</label>
            <Select value={ticketFilter} onValueChange={onTicketFilterChange}>
              <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="All Tickets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tickets</SelectItem>
                <SelectItem value="with-tickets">With Tickets</SelectItem>
                <SelectItem value="no-tickets">No Tickets</SelectItem>
                <SelectItem value="urgent-tickets">Urgent Tickets</SelectItem>
                <SelectItem value="open-tickets">Open Tickets</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <DateRangeFilter
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
          />
        </div>

        {/* Saved Presets */}
        <FilterPresets
          savedPresets={savedPresets}
          onApplyPreset={onApplyPreset}
          onSavePreset={onSavePreset}
        />
      </div>
    </div>
  );
});

EnhancedFilters.displayName = 'EnhancedFilters';

export default EnhancedFilters;
