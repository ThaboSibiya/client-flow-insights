
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
import { Badge } from '@/components/ui/badge';
import { Search, Calendar as CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';

interface AdvancedFiltersProps {
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
  onTicketFilterChange: (filter: string) => void;
}

const AdvancedFilters = ({ 
  statusFilter, 
  onStatusFilterChange, 
  searchQuery, 
  onSearchQueryChange,
  onDateRangeChange,
  onTicketFilterChange
}: AdvancedFiltersProps) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [ticketFilter, setTicketFilter] = useState<string>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleDateRangeApply = () => {
    onDateRangeChange(startDate, endDate);
  };

  const clearDateRange = () => {
    setStartDate(null);
    setEndDate(null);
    onDateRangeChange(null, null);
  };

  const handleTicketFilterChange = (value: string) => {
    setTicketFilter(value);
    onTicketFilterChange(value);
  };

  const activeFiltersCount = [
    statusFilter !== 'all',
    searchQuery !== '',
    startDate || endDate,
    ticketFilter !== 'all'
  ].filter(Boolean).length;

  return (
    <div className="p-6 bg-gradient-to-r from-white via-gray-50 to-white border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
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
              {/* Date Range Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 min-w-fit">Created:</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'MMM dd') : 'From'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate || undefined}
                      onSelect={(date) => setStartDate(date || null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <span className="text-gray-500">to</span>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'MMM dd') : 'To'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate || undefined}
                      onSelect={(date) => setEndDate(date || null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Button size="sm" onClick={handleDateRangeApply} disabled={!startDate && !endDate}>
                  Apply
                </Button>
                
                {(startDate || endDate) && (
                  <Button size="sm" variant="ghost" onClick={clearDateRange}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Ticket Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 min-w-fit">Tickets:</span>
                <Select value={ticketFilter} onValueChange={handleTicketFilterChange}>
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

export default AdvancedFilters;
