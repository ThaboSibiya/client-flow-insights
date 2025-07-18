
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Filter, 
  Search, 
  SortAsc, 
  SortDesc, 
  Calendar as CalendarIcon,
  X,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

interface ConversationFiltersAdvancedProps {
  filters: any;
  sortOptions: any;
  onUpdateFilter: (key: string, value: any) => void;
  onUpdateSort: (field: string, direction?: string) => void;
  onResetFilters: () => void;
  activeFiltersCount: number;
  employees?: any[];
}

const ConversationFiltersAdvanced = ({
  filters,
  sortOptions,
  onUpdateFilter,
  onUpdateSort,
  onResetFilters,
  activeFiltersCount,
  employees = []
}: ConversationFiltersAdvancedProps) => {
  return (
    <div className="bg-white border-b border-quikle-silver/30 p-4">
      <div className="flex flex-col gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-quikle-neutral" />
          <Input
            placeholder="Search conversations..."
            value={filters.searchQuery}
            onChange={(e) => onUpdateFilter('searchQuery', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Type Filter */}
          <Select value={filters.type} onValueChange={(value) => onUpdateFilter('type', value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="internal_chat">Internal</SelectItem>
              <SelectItem value="form_submission">Forms</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={filters.status} onValueChange={(value) => onUpdateFilter('status', value)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>

          {/* Assigned To Filter */}
          <Select value={filters.assignedTo} onValueChange={(value) => onUpdateFilter('assignedTo', value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Assigned to" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "LLL dd")} - {format(filters.dateRange.to, "LLL dd")}
                    </>
                  ) : (
                    format(filters.dateRange.from, "LLL dd, y")
                  )
                ) : (
                  "Pick a date"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange.from}
                selected={{
                  from: filters.dateRange.from,
                  to: filters.dateRange.to
                }}
                onSelect={(range) => onUpdateFilter('dateRange', range || { from: null, to: null })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {/* Sort Options */}
          <Select 
            value={`${sortOptions.field}-${sortOptions.direction}`} 
            onValueChange={(value) => {
              const [field, direction] = value.split('-');
              onUpdateSort(field, direction);
            }}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last_message_at-desc">
                <div className="flex items-center">
                  <SortDesc className="mr-2 h-4 w-4" />
                  Latest Activity
                </div>
              </SelectItem>
              <SelectItem value="last_message_at-asc">
                <div className="flex items-center">
                  <SortAsc className="mr-2 h-4 w-4" />
                  Oldest Activity
                </div>
              </SelectItem>
              <SelectItem value="created_at-desc">
                <div className="flex items-center">
                  <SortDesc className="mr-2 h-4 w-4" />
                  Newest First
                </div>
              </SelectItem>
              <SelectItem value="created_at-asc">
                <div className="flex items-center">
                  <SortAsc className="mr-2 h-4 w-4" />
                  Oldest First
                </div>
              </SelectItem>
              <SelectItem value="unread_count-desc">
                <div className="flex items-center">
                  <SortDesc className="mr-2 h-4 w-4" />
                  Most Unread
                </div>
              </SelectItem>
              <SelectItem value="subject-asc">
                <div className="flex items-center">
                  <SortAsc className="mr-2 h-4 w-4" />
                  Subject A-Z
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Filters */}
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              className="shrink-0"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationFiltersAdvanced;
