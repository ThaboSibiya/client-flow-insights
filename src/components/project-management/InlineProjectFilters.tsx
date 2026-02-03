import React, { memo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  X, 
  Filter,
  ChevronDown 
} from "lucide-react";
import { 
  ProjectFilters as ProjectFiltersType, 
  Priority, 
  ProjectStatus, 
  ProjectType, 
  TeamMember 
} from '@/types/project';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';

interface InlineProjectFiltersProps {
  filters: ProjectFiltersType;
  onFiltersChange: (filters: ProjectFiltersType) => void;
  teamMembers: TeamMember[];
  projectCount: number;
}

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: 'not-started', label: 'Not Started' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const priorityOptions: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const typeOptions: { value: ProjectType; label: string }[] = [
  { value: 'development', label: 'Development' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'design', label: 'Design' },
  { value: 'research', label: 'Research' },
  { value: 'maintenance', label: 'Maintenance' },
];

// Quick filter presets
const quickFilters = [
  { label: 'All', filter: () => ({ status: [], priority: [], type: [] }) },
  { label: 'Active', filter: () => ({ status: ['in-progress' as ProjectStatus], priority: [], type: [] }) },
  { label: 'Completed', filter: () => ({ status: ['completed' as ProjectStatus], priority: [], type: [] }) },
  { label: 'Urgent', filter: () => ({ status: [], priority: ['urgent' as Priority], type: [] }) },
];

const InlineProjectFilters = memo(({ 
  filters, 
  onFiltersChange, 
  teamMembers,
  projectCount 
}: InlineProjectFiltersProps) => {
  
  const updateFilter = <K extends keyof ProjectFiltersType>(
    key: K,
    value: ProjectFiltersType[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = <T extends string>(
    key: keyof ProjectFiltersType,
    value: T
  ) => {
    const currentArray = filters[key] as T[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilter(key, newArray as ProjectFiltersType[typeof key]);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      status: [],
      priority: [],
      type: [],
      owner: [],
      dateRange: { start: null, end: null },
      search: '',
    });
  };

  const applyQuickFilter = (filterFn: () => { status: ProjectStatus[]; priority: Priority[]; type: ProjectType[] }) => {
    const { status, priority, type } = filterFn();
    onFiltersChange({
      ...filters,
      status,
      priority,
      type,
    });
  };

  const hasActiveFilters = 
    filters.status.length > 0 ||
    filters.priority.length > 0 ||
    filters.type.length > 0 ||
    filters.owner.length > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end ||
    filters.search;

  const activeFilterCount = 
    filters.status.length +
    filters.priority.length +
    filters.type.length +
    filters.owner.length +
    (filters.dateRange.start ? 1 : 0) +
    (filters.dateRange.end ? 1 : 0);

  const getActiveQuickFilter = () => {
    if (filters.status.length === 1 && filters.status[0] === 'in-progress' && filters.priority.length === 0) return 'Active';
    if (filters.status.length === 1 && filters.status[0] === 'completed' && filters.priority.length === 0) return 'Completed';
    if (filters.priority.length === 1 && filters.priority[0] === 'urgent' && filters.status.length === 0) return 'Urgent';
    if (filters.status.length === 0 && filters.priority.length === 0 && filters.type.length === 0) return 'All';
    return null;
  };

  return (
    <div className="space-y-3">
      {/* Main Filter Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9 h-9 bg-background border-border/50"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => updateFilter('search', '')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-1 border border-border/50 rounded-lg p-0.5 bg-muted/30">
          {quickFilters.map((qf) => (
            <Button
              key={qf.label}
              variant={getActiveQuickFilter() === qf.label ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => applyQuickFilter(qf.filter)}
            >
              {qf.label}
            </Button>
          ))}
        </div>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 border-border/50">
              Status
              {filters.status.length > 0 && (
                <Badge variant="secondary" className="h-5 w-5 p-0 text-[10px] rounded-full">
                  {filters.status.length}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Filter by status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {statusOptions.map(option => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={filters.status.includes(option.value)}
                onCheckedChange={() => toggleArrayFilter('status', option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Priority Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 border-border/50">
              Priority
              {filters.priority.length > 0 && (
                <Badge variant="secondary" className="h-5 w-5 p-0 text-[10px] rounded-full">
                  {filters.priority.length}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Filter by priority</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {priorityOptions.map(option => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={filters.priority.includes(option.value)}
                onCheckedChange={() => toggleArrayFilter('priority', option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Type Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 border-border/50">
              Type
              {filters.type.length > 0 && (
                <Badge variant="secondary" className="h-5 w-5 p-0 text-[10px] rounded-full">
                  {filters.type.length}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuLabel className="text-xs text-muted-foreground">Filter by type</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {typeOptions.map(option => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={filters.type.includes(option.value)}
                onCheckedChange={() => toggleArrayFilter('type', option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Date Range */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 gap-1.5 border-border/50">
              {filters.dateRange.start || filters.dateRange.end ? (
                <>
                  {filters.dateRange.start ? format(filters.dateRange.start, 'MMM d') : 'Start'}
                  {' - '}
                  {filters.dateRange.end ? format(filters.dateRange.end, 'MMM d') : 'End'}
                </>
              ) : (
                'Date Range'
              )}
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{
                from: filters.dateRange.start || undefined,
                to: filters.dateRange.end || undefined,
              }}
              onSelect={(range) => {
                updateFilter('dateRange', {
                  start: range?.from || null,
                  end: range?.to || null,
                });
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {/* Clear All */}
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 text-muted-foreground hover:text-foreground"
            onClick={clearAllFilters}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        )}

        {/* Project Count */}
        <span className="text-xs text-muted-foreground ml-auto">
          {projectCount} project{projectCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Active Filter Tags */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filters.status.map(status => (
            <Badge 
              key={status} 
              variant="secondary" 
              className="gap-1 text-xs font-normal cursor-pointer hover:bg-secondary/80"
              onClick={() => toggleArrayFilter('status', status)}
            >
              {statusOptions.find(s => s.value === status)?.label}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          
          {filters.priority.map(priority => (
            <Badge 
              key={priority} 
              variant="secondary" 
              className="gap-1 text-xs font-normal cursor-pointer hover:bg-secondary/80"
              onClick={() => toggleArrayFilter('priority', priority)}
            >
              {priorityOptions.find(p => p.value === priority)?.label}
              <X className="h-3 w-3" />
            </Badge>
          ))}
          
          {filters.type.map(type => (
            <Badge 
              key={type} 
              variant="secondary" 
              className="gap-1 text-xs font-normal cursor-pointer hover:bg-secondary/80"
              onClick={() => toggleArrayFilter('type', type)}
            >
              {typeOptions.find(t => t.value === type)?.label}
              <X className="h-3 w-3" />
            </Badge>
          ))}

          {(filters.dateRange.start || filters.dateRange.end) && (
            <Badge 
              variant="secondary" 
              className="gap-1 text-xs font-normal cursor-pointer hover:bg-secondary/80"
              onClick={() => updateFilter('dateRange', { start: null, end: null })}
            >
              {filters.dateRange.start && format(filters.dateRange.start, 'MMM d')}
              {filters.dateRange.start && filters.dateRange.end && ' - '}
              {filters.dateRange.end && format(filters.dateRange.end, 'MMM d')}
              <X className="h-3 w-3" />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
});

InlineProjectFilters.displayName = 'InlineProjectFilters';

export default InlineProjectFilters;
