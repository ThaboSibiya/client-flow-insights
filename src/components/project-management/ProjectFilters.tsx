
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Filter, X, CalendarIcon } from "lucide-react";
import { ProjectFilters as ProjectFiltersType, Priority, ProjectStatus, ProjectType, TeamMember } from '@/types/project';
import { format } from 'date-fns';

interface ProjectFiltersProps {
  filters: ProjectFiltersType;
  onFiltersChange: (filters: ProjectFiltersType) => void;
  teamMembers: TeamMember[];
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

const ProjectFilters = ({ filters, onFiltersChange, teamMembers }: ProjectFiltersProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

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
    (filters.dateRange.end ? 1 : 0) +
    (filters.search ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {filters.search}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => updateFilter('search', '')}
              />
            </Badge>
          )}
          
          {filters.status.map(status => (
            <Badge key={status} variant="secondary" className="flex items-center gap-1">
              Status: {statusOptions.find(s => s.value === status)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleArrayFilter('status', status)}
              />
            </Badge>
          ))}
          
          {filters.priority.map(priority => (
            <Badge key={priority} variant="secondary" className="flex items-center gap-1">
              Priority: {priorityOptions.find(p => p.value === priority)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleArrayFilter('priority', priority)}
              />
            </Badge>
          ))}
          
          {filters.type.map(type => (
            <Badge key={type} variant="secondary" className="flex items-center gap-1">
              Type: {typeOptions.find(t => t.value === type)?.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => toggleArrayFilter('type', type)}
              />
            </Badge>
          ))}
          
          {filters.owner.map(ownerId => {
            const owner = teamMembers.find(m => m.id === ownerId);
            return owner ? (
              <Badge key={ownerId} variant="secondary" className="flex items-center gap-1">
                Owner: {owner.name}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => toggleArrayFilter('owner', ownerId)}
                />
              </Badge>
            ) : null;
          })}
        </div>
      )}

      {/* Filter Panel */}
      {isOpen && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Filter Projects
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="space-y-1">
                  {statusOptions.map(option => (
                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(option.value)}
                        onChange={() => toggleArrayFilter('status', option.value)}
                        className="rounded"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div className="space-y-2">
                <Label>Priority</Label>
                <div className="space-y-1">
                  {priorityOptions.map(option => (
                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.priority.includes(option.value)}
                        onChange={() => toggleArrayFilter('priority', option.value)}
                        className="rounded"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <Label>Type</Label>
                <div className="space-y-1">
                  {typeOptions.map(option => (
                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.type.includes(option.value)}
                        onChange={() => toggleArrayFilter('type', option.value)}
                        className="rounded"
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Owner Filter */}
              <div className="space-y-2">
                <Label>Project Owner</Label>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {teamMembers.map(member => (
                    <label key={member.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.owner.includes(member.id)}
                        onChange={() => toggleArrayFilter('owner', member.id)}
                        className="rounded"
                      />
                      <span className="text-sm">{member.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex items-center gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {filters.dateRange.start ? format(filters.dateRange.start, 'MMM dd, yyyy') : 'Start Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.start || undefined}
                      onSelect={(date) => updateFilter('dateRange', { ...filters.dateRange, start: date || null })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <span className="text-muted-foreground">to</span>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {filters.dateRange.end ? format(filters.dateRange.end, 'MMM dd, yyyy') : 'End Date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.end || undefined}
                      onSelect={(date) => updateFilter('dateRange', { ...filters.dateRange, end: date || null })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectFilters;
