
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  X, 
  Download,
  Filter,
  Calendar,
  ChevronDown
} from 'lucide-react';
import DateRangeSelector from './DateRangeSelector';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface FilterPreset {
  id: string;
  name: string;
  filters: any;
}

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface UnifiedToolbarProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  ticketFilter: string;
  onTicketFilterChange: (filter: string) => void;
  savedPresets: FilterPreset[];
  onApplyPreset: (preset: FilterPreset) => void;
  onSavePreset: (name: string) => void;
  onQuickDateRange: (range: string) => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onExportExcel: () => void;
}

const UnifiedToolbar = ({ 
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
  onQuickDateRange,
  onExportCSV,
  onExportJSON,
  onExportExcel
}: UnifiedToolbarProps) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const activeFiltersCount = [
    statusFilter !== 'all',
    dateRange.start || dateRange.end,
    ticketFilter !== 'all'
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    onStatusFilterChange('all');
    onSearchQueryChange('');
    onDateRangeChange({ start: null, end: null });
    onTicketFilterChange('all');
  };

  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'text-quikle-charcoal' },
    { value: 'new', label: 'New', color: 'text-blue-600' },
    { value: 'existing', label: 'Existing', color: 'text-emerald-600' },
    { value: 'pending', label: 'Pending', color: 'text-amber-600' },
    { value: 'finalised', label: 'Finalised', color: 'text-purple-600' },
  ];

  return (
    <div className="bg-white border border-quikle-silver/20 rounded-lg shadow-sm p-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-quikle-slate pointer-events-none" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="pl-9 pr-8 h-9 bg-quikle-crystal/30 border-transparent focus:border-quikle-primary/30 focus:bg-white transition-all text-sm"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchQueryChange('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-quikle-crystal"
            >
              <X className="h-3 w-3 text-quikle-slate" />
            </Button>
          )}
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-[130px] h-9 bg-white border-quikle-silver/30 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-white border-quikle-silver/20">
            {statusOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value} className={opt.color}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* More Filters Popover */}
        <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="h-9 px-3 border-quikle-silver/30 text-quikle-slate hover:bg-quikle-crystal/50 relative"
            >
              <Filter className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Filters</span>
              {activeFiltersCount > 0 && (
                <Badge className="ml-1.5 h-5 min-w-[20px] px-1.5 bg-quikle-primary text-white text-[10px]">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-4 bg-white border-quikle-silver/20 shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-quikle-charcoal">Filters</span>
                {activeFiltersCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearAllFilters}
                    className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-quikle-slate">Date Range</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['Today', 'Week', 'Month', 'Quarter'].map((range) => (
                    <Button
                      key={range}
                      variant="outline"
                      size="sm"
                      onClick={() => onQuickDateRange(range.toLowerCase())}
                      className="h-7 text-xs px-2 border-quikle-silver/30"
                    >
                      {range}
                    </Button>
                  ))}
                </div>
                <DateRangeSelector 
                  dateRange={dateRange}
                  onDateRangeChange={onDateRangeChange}
                />
              </div>

              {/* Ticket Filter */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-quikle-slate">Ticket Status</label>
                <Select value={ticketFilter} onValueChange={onTicketFilterChange}>
                  <SelectTrigger className="h-9 border-quikle-silver/30 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-quikle-silver/20">
                    <SelectItem value="all">All Clients</SelectItem>
                    <SelectItem value="with-tickets">Has Tickets</SelectItem>
                    <SelectItem value="no-tickets">No Tickets</SelectItem>
                    <SelectItem value="urgent-tickets">Urgent Tickets</SelectItem>
                    <SelectItem value="open-tickets">Open Tickets</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Saved Presets */}
              {savedPresets.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-quikle-silver/20">
                  <label className="text-xs font-medium text-quikle-slate">Saved Filters</label>
                  <div className="flex flex-wrap gap-1.5">
                    {savedPresets.map((preset) => (
                      <Button
                        key={preset.id}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onApplyPreset(preset);
                          setIsFiltersOpen(false);
                        }}
                        className="h-7 text-xs px-2 border-quikle-silver/30"
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="h-9 px-3 border-quikle-silver/30 text-quikle-slate hover:bg-quikle-crystal/50"
            >
              <Download className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 bg-white border-quikle-silver/20">
            <DropdownMenuItem onClick={onExportCSV}>
              Export CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportJSON}>
              Export JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportExcel}>
              Export Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filter Chips */}
      {(activeFiltersCount > 0 || searchQuery) && (
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-quikle-silver/10">
          {searchQuery && (
            <Badge variant="secondary" className="bg-quikle-crystal text-quikle-charcoal text-xs gap-1 pr-1">
              Search: {searchQuery}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSearchQueryChange('')}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {statusFilter !== 'all' && (
            <Badge variant="secondary" className="bg-quikle-crystal text-quikle-charcoal text-xs gap-1 pr-1">
              Status: {statusFilter}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onStatusFilterChange('all')}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {(dateRange.start || dateRange.end) && (
            <Badge variant="secondary" className="bg-quikle-crystal text-quikle-charcoal text-xs gap-1 pr-1">
              <Calendar className="h-3 w-3" />
              Date filter
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDateRangeChange({ start: null, end: null })}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {ticketFilter !== 'all' && (
            <Badge variant="secondary" className="bg-quikle-crystal text-quikle-charcoal text-xs gap-1 pr-1">
              Tickets: {ticketFilter}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTicketFilterChange('all')}
                className="h-4 w-4 p-0 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default UnifiedToolbar;
