
import React from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Search, Calendar as CalendarIcon, Filter, X, Save, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface FilterPreset {
  id: string;
  name: string;
  filters: any;
}

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface EnhancedFiltersProps {
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
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [presetName, setPresetName] = React.useState('');
  const [showPresetInput, setShowPresetInput] = React.useState(false);

  const activeFiltersCount = [
    statusFilter !== 'all',
    searchQuery !== '',
    dateRange.start || dateRange.end,
    ticketFilter !== 'all'
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    onStatusFilterChange('all');
    onSearchQueryChange('');
    onDateRangeChange({ start: null, end: null });
    onTicketFilterChange('all');
  };

  const handleSavePreset = () => {
    if (presetName.trim()) {
      onSavePreset(presetName.trim());
      setPresetName('');
      setShowPresetInput(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-r from-white via-quikle-crystal to-quikle-platinum border border-quikle-silver/30 rounded-lg shadow-elegant hover:shadow-luxury transition-shadow duration-300">
      <div className="space-y-4">
        {/* Basic Filters Row */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
            {/* Search */}
            <div className="relative min-w-[300px]">
              <Input
                placeholder="Search customers by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="pl-9 bg-white border-quikle-silver/50 shadow-sm hover:shadow focus:shadow-md transition-all focus:border-quikle-primary/50 text-quikle-charcoal"
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-quikle-slate" />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-[180px] bg-white border-quikle-silver/50 shadow-sm hover:shadow text-quikle-charcoal">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-quikle-silver/30 z-50">
                <SelectItem value="all" className="text-quikle-charcoal hover:bg-quikle-crystal">All Customers</SelectItem>
                <SelectItem value="new" className="text-quikle-primary hover:bg-quikle-crystal">New</SelectItem>
                <SelectItem value="existing" className="text-emerald-700 hover:bg-emerald-50">Existing</SelectItem>
                <SelectItem value="pending" className="text-quikle-accent hover:bg-quikle-crystal">Pending Policy</SelectItem>
                <SelectItem value="finalised" className="text-purple-700 hover:bg-purple-50">Finalised Sale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-quikle-primary/10 text-quikle-primary border-quikle-primary/20">
                {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 border-quikle-silver/50 text-quikle-charcoal hover:bg-quikle-crystal"
            >
              <Filter className="h-4 w-4" />
              Advanced
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="pt-4 border-t border-quikle-silver/30 space-y-4">
            {/* Quick Date Ranges */}
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

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Date Range Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-quikle-charcoal min-w-fit">Created:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[140px] justify-start text-left font-normal border-quikle-silver/50 text-quikle-slate hover:bg-quikle-crystal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.start ? format(dateRange.start, 'MMM dd') : 'From'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white border-quikle-silver/30 z-50">
                    <Calendar
                      mode="single"
                      selected={dateRange.start || undefined}
                      onSelect={(date) => onDateRangeChange({ ...dateRange, start: date || null })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <span className="text-quikle-slate">to</span>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[140px] justify-start text-left font-normal border-quikle-silver/50 text-quikle-slate hover:bg-quikle-crystal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.end ? format(dateRange.end, 'MMM dd') : 'To'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white border-quikle-silver/30 z-50">
                    <Calendar
                      mode="single"
                      selected={dateRange.end || undefined}
                      onSelect={(date) => onDateRangeChange({ ...dateRange, end: date || null })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                {(dateRange.start || dateRange.end) && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => onDateRangeRange({ start: null, end: null })}
                    className="text-quikle-slate hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Ticket Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-quikle-charcoal min-w-fit">Tickets:</span>
                <Select value={ticketFilter} onValueChange={onTicketFilterChange}>
                  <SelectTrigger className="w-[160px] border-quikle-silver/50 text-quikle-slate hover:bg-quikle-crystal">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-quikle-silver/30 z-50">
                    <SelectItem value="all" className="text-quikle-charcoal hover:bg-quikle-crystal">All Customers</SelectItem>
                    <SelectItem value="with-tickets" className="text-quikle-slate hover:bg-quikle-crystal">Has Tickets</SelectItem>
                    <SelectItem value="no-tickets" className="text-quikle-slate hover:bg-quikle-crystal">No Tickets</SelectItem>
                    <SelectItem value="urgent-tickets" className="text-red-700 hover:bg-red-50">Urgent Tickets</SelectItem>
                    <SelectItem value="open-tickets" className="text-quikle-accent hover:bg-quikle-crystal">Open Tickets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Saved Presets */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-quikle-charcoal">Presets:</span>
                {savedPresets.map((preset) => (
                  <Button
                    key={preset.id}
                    variant="outline"
                    size="sm"
                    onClick={() => onApplyPreset(preset)}
                    className="border-quikle-silver/50 text-quikle-slate hover:bg-quikle-crystal hover:text-quikle-primary"
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                {showPresetInput ? (
                  <>
                    <Input
                      placeholder="Preset name"
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      className="w-32 border-quikle-silver/50 text-quikle-charcoal"
                      onKeyPress={(e) => e.key === 'Enter' && handleSavePreset()}
                    />
                    <Button size="sm" onClick={handleSavePreset} className="bg-quikle-primary hover:bg-quikle-secondary text-white">
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => {
                        setShowPresetInput(false);
                        setPresetName('');
                      }}
                      className="text-quikle-slate hover:text-red-600 hover:bg-red-50"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPresetInput(true)}
                    disabled={activeFiltersCount === 0}
                    className="border-quikle-silver/50 text-quikle-slate hover:bg-quikle-crystal disabled:text-quikle-neutral"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save Preset
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedFilters;
