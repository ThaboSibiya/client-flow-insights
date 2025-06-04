
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar as CalendarIcon, Filter, X, Save, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { FilterPreset } from '@/hooks/useCustomerFilters';

interface EnhancedFiltersProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  dateRange: { start: Date | null; end: Date | null };
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
  ticketFilter: string;
  onTicketFilterChange: (filter: string) => void;
  savedPresets: FilterPreset[];
  onApplyPreset: (presetId: string) => void;
  onSavePreset: (name: string) => void;
  onQuickDateRange: (range: string) => void;
}

const EnhancedFilters = ({ 
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [presetName, setPresetName] = useState('');

  const handleDateRangeApply = () => {
    // Date range is already set through individual date pickers
  };

  const clearDateRange = () => {
    onDateRangeChange(null, null);
  };

  const activeFiltersCount = [
    statusFilter !== 'all',
    searchQuery !== '',
    dateRange.start || dateRange.end,
    ticketFilter !== 'all'
  ].filter(Boolean).length;

  const quickDateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 days', value: 'week' },
    { label: 'This month', value: 'month' },
    { label: 'This quarter', value: 'quarter' },
    { label: 'Clear', value: 'clear' },
  ];

  return (
    <div className="p-6 bg-gradient-to-r from-white via-gray-50 to-white border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="space-y-4">
        {/* Saved Presets Row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Quick filters:</span>
          {savedPresets.map((preset) => (
            <Button
              key={preset.id}
              variant="outline"
              size="sm"
              onClick={() => onApplyPreset(preset.id)}
              className="h-7 text-xs"
            >
              {preset.name}
            </Button>
          ))}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                <Save className="h-3 w-3 mr-1" />
                Save Filter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Current Filter</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Enter preset name..."
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                />
                <Button 
                  onClick={() => {
                    if (presetName.trim()) {
                      onSavePreset(presetName.trim());
                      setPresetName('');
                    }
                  }}
                  disabled={!presetName.trim()}
                  className="w-full"
                >
                  Save Preset
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Basic Filters Row */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            {/* Search */}
            <div className="relative min-w-[300px]">
              <Input
                placeholder="Search customers by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="pl-9 bg-white shadow-sm hover:shadow focus:shadow-md transition-all"
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-[180px] bg-white shadow-sm hover:shadow">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="existing">Existing</SelectItem>
                <SelectItem value="pending">Pending Policy</SelectItem>
                <SelectItem value="finalised">Finalised Sale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Toggle */}
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Advanced
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="pt-4 border-t space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Quick Date Range Selectors */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 min-w-fit">Quick dates:</span>
                <div className="flex gap-1">
                  {quickDateRanges.map(({ label, value }) => (
                    <Button
                      key={value}
                      variant="outline"
                      size="sm"
                      onClick={() => value === 'clear' ? clearDateRange() : onQuickDateRange(value)}
                      className="h-7 text-xs"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Custom Date Range Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 min-w-fit">Custom range:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.start ? format(dateRange.start, 'MMM dd') : 'From'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.start || undefined}
                      onSelect={(date) => onDateRangeChange(date || null, dateRange.end)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <span className="text-gray-500">to</span>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.end ? format(dateRange.end, 'MMM dd') : 'To'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.end || undefined}
                      onSelect={(date) => onDateRangeChange(dateRange.start, date || null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                {(dateRange.start || dateRange.end) && (
                  <Button size="sm" variant="ghost" onClick={clearDateRange}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Ticket Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 min-w-fit">Tickets:</span>
                <Select value={ticketFilter} onValueChange={onTicketFilterChange}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers</SelectItem>
                    <SelectItem value="with-tickets">Has Tickets</SelectItem>
                    <SelectItem value="no-tickets">No Tickets</SelectItem>
                    <SelectItem value="urgent-tickets">Urgent Tickets</SelectItem>
                    <SelectItem value="open-tickets">Open Tickets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedFilters;
