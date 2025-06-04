
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
import { Search, Calendar as CalendarIcon, Filter, Save, Star } from 'lucide-react';
import { format } from 'date-fns';
import { FilterPreset } from '@/hooks/useCustomerFilters';

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
  const [presetName, setPresetName] = useState('');
  const [showPresetDialog, setShowPresetDialog] = useState(false);

  const quickDateRanges = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 days', value: 'week' },
    { label: 'This month', value: 'month' },
    { label: 'This quarter', value: 'quarter' },
  ];

  const handleDateRangeSelect = (field: 'start' | 'end', date: Date | undefined) => {
    onDateRangeChange({
      ...dateRange,
      [field]: date || null
    });
  };

  const clearDateRange = () => {
    onDateRangeChange({ start: null, end: null });
  };

  const savePreset = () => {
    if (presetName.trim()) {
      onSavePreset(presetName.trim());
      setPresetName('');
      setShowPresetDialog(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-r from-white via-gray-50 to-white border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 space-y-4">
      {/* Quick Date Range Buttons */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-700 self-center">Quick dates:</span>
        {quickDateRanges.map((range) => (
          <Button
            key={range.value}
            variant="outline"
            size="sm"
            onClick={() => onQuickDateRange(range.value)}
            className="text-xs"
          >
            {range.label}
          </Button>
        ))}
        {(dateRange.start || dateRange.end) && (
          <Button variant="ghost" size="sm" onClick={clearDateRange} className="text-xs text-red-600">
            Clear dates
          </Button>
        )}
      </div>

      {/* Main Filters Row */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="pl-10 bg-white shadow-sm hover:shadow focus:shadow-md transition-all"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[180px] bg-white shadow-sm hover:shadow">
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

        {/* Ticket Filter */}
        <Select value={ticketFilter} onValueChange={onTicketFilterChange}>
          <SelectTrigger className="w-[180px] bg-white shadow-sm hover:shadow">
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

        {/* Date Range */}
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.start ? format(dateRange.start, 'MMM dd') : 'Start date'}
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
              <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.end ? format(dateRange.end, 'MMM dd') : 'End date'}
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

      {/* Saved Presets and Actions */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
        <span className="text-sm font-medium text-gray-700">Presets:</span>
        {savedPresets.map((preset) => (
          <Badge
            key={preset.id}
            variant="outline"
            className="cursor-pointer hover:bg-blue-50 transition-colors"
            onClick={() => onApplyPreset(preset.id)}
          >
            <Star className="w-3 h-3 mr-1" />
            {preset.name}
          </Badge>
        ))}
        
        <Dialog open={showPresetDialog} onOpenChange={setShowPresetDialog}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <Save className="w-4 h-4 mr-1" />
              Save preset
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Filter Preset</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Preset name..."
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && savePreset()}
              />
              <div className="flex gap-2">
                <Button onClick={savePreset} disabled={!presetName.trim()}>
                  Save
                </Button>
                <Button variant="outline" onClick={() => setShowPresetDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EnhancedFilters;
