
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Calendar as CalendarIcon, Save, Star, Filter } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';
import { FilterPreset } from '@/hooks/useCustomerFilters/types';

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
  const [presetName, setPresetName] = useState('');
  const [showPresetDialog, setShowPresetDialog] = useState(false);

  const quickDateRanges = React.useMemo(() => [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 days', value: 'week' },
    { label: 'This month', value: 'month' },
    { label: 'This quarter', value: 'quarter' },
  ], []);

  const handleDateRangeSelect = React.useCallback((field: 'start' | 'end', date: Date | undefined) => {
    onDateRangeChange({
      ...dateRange,
      [field]: date || null
    });
  }, [dateRange, onDateRangeChange]);

  const clearDateRange = React.useCallback(() => {
    onDateRangeChange({ start: null, end: null });
  }, [onDateRangeChange]);

  const savePreset = React.useCallback(() => {
    if (presetName.trim()) {
      onSavePreset(presetName.trim());
      setPresetName('');
      setShowPresetDialog(false);
    }
  }, [presetName, onSavePreset]);

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
                onClick={clearDateRange} 
                className="text-xs text-red-600 hover:bg-red-50"
              >
                Clear dates
              </Button>
            )}
          </div>
        </div>

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
        </div>

        {/* Saved Presets */}
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">Saved Presets</label>
            <Dialog open={showPresetDialog} onOpenChange={setShowPresetDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-slate-300 hover:bg-slate-50">
                  <Save className="w-4 h-4 mr-2" />
                  Save Current
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Filter Preset</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Enter preset name..."
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && savePreset()}
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <div className="flex gap-2">
                    <Button onClick={savePreset} disabled={!presetName.trim()}>
                      Save Preset
                    </Button>
                    <Button variant="outline" onClick={() => setShowPresetDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {savedPresets.map((preset) => (
              <Badge
                key={preset.id}
                variant="outline"
                className="cursor-pointer hover:bg-blue-50 border-blue-200 text-blue-800 transition-colors"
                onClick={() => onApplyPreset(preset.id)}
              >
                <Star className="w-3 h-3 mr-1" />
                {preset.name}
              </Badge>
            ))}
            {savedPresets.length === 0 && (
              <span className="text-sm text-slate-500 italic">No saved presets yet</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

EnhancedFilters.displayName = 'EnhancedFilters';

export default EnhancedFilters;
