
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Filter, X, Save, Settings, Calendar as CalendarIcon } from "lucide-react";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

interface PipelineAdvancedFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStageIds: string[];
  setSelectedStageIds: (ids: string[]) => void;
  selectedPriorities: string[];
  setSelectedPriorities: (priorities: string[]) => void;
  selectedAssignees: string[];
  setSelectedAssignees: (assignees: string[]) => void;
  dateRange: { start: Date | null; end: Date | null };
  setDateRange: (range: { start: Date | null; end: Date | null }) => void;
  selectedStatuses: string[];
  setSelectedStatuses: (statuses: string[]) => void;
  stages: any[];
  savedPresets: any[];
  applyPreset: (presetId: string) => void;
  saveCurrentAsPreset: (name: string) => void;
  deletePreset: (presetId: string) => void;
  clearFilters: () => void;
  activeFiltersCount: number;
  type: 'customer' | 'ticket';
}

const PipelineAdvancedFilters = ({
  searchQuery,
  setSearchQuery,
  selectedStageIds,
  setSelectedStageIds,
  selectedPriorities,
  setSelectedPriorities,
  selectedAssignees,
  setSelectedAssignees,
  dateRange,
  setDateRange,
  selectedStatuses,
  setSelectedStatuses,
  stages,
  savedPresets,
  applyPreset,
  saveCurrentAsPreset,
  deletePreset,
  clearFilters,
  activeFiltersCount,
  type
}: PipelineAdvancedFiltersProps) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isSavePresetOpen, setIsSavePresetOpen] = useState(false);
  const [presetName, setPresetName] = useState('');

  const priorities = type === 'customer' 
    ? ['high', 'medium', 'low']
    : ['urgent', 'high', 'medium', 'low'];

  const statuses = type === 'customer'
    ? ['new', 'existing', 'pending', 'finalised']
    : ['open', 'in-progress', 'resolved', 'closed'];

  // Get unique assignees from all stages
  const allAssignees = React.useMemo(() => {
    const assignees = new Set<string>();
    stages.forEach(stage => {
      const items = type === 'customer' ? (stage.customers || []) : (stage.tickets || []);
      items.forEach((item: any) => {
        const assignee = item.assignedTo?.name || item.assigned_to_name;
        if (assignee) assignees.add(assignee);
      });
    });
    return Array.from(assignees);
  }, [stages, type]);

  const handleStageToggle = (stageId: string) => {
    const newSelectedStageIds = selectedStageIds.includes(stageId) 
      ? selectedStageIds.filter(id => id !== stageId)
      : [...selectedStageIds, stageId];
    setSelectedStageIds(newSelectedStageIds);
  };

  const handlePriorityToggle = (priority: string) => {
    const newSelectedPriorities = selectedPriorities.includes(priority) 
      ? selectedPriorities.filter(p => p !== priority)
      : [...selectedPriorities, priority];
    setSelectedPriorities(newSelectedPriorities);
  };

  const handleStatusToggle = (status: string) => {
    const newSelectedStatuses = selectedStatuses.includes(status) 
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status];
    setSelectedStatuses(newSelectedStatuses);
  };

  const handleAssigneeToggle = (assignee: string) => {
    const newSelectedAssignees = selectedAssignees.includes(assignee) 
      ? selectedAssignees.filter(a => a !== assignee)
      : [...selectedAssignees, assignee];
    setSelectedAssignees(newSelectedAssignees);
  };

  const handleSavePreset = () => {
    if (presetName.trim()) {
      saveCurrentAsPreset(presetName.trim());
      setPresetName('');
      setIsSavePresetOpen(false);
    }
  };

  return (
    <div className="space-y-4 bg-white p-4 rounded-lg border border-quikle-silver/30">
      {/* Search and Quick Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-quikle-slate" />
            <Input
              placeholder={`Search ${type}s...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Preset Selector */}
        <Select onValueChange={applyPreset}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter presets" />
          </SelectTrigger>
          <SelectContent>
            {savedPresets.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                {preset.name}
                {preset.isDefault && <Badge variant="outline" className="ml-2 text-xs">Default</Badge>}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Advanced Filters Button */}
        <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="end">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Advanced Filters</h4>
                <div className="flex gap-2">
                  <Dialog open={isSavePresetOpen} onOpenChange={setIsSavePresetOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Save className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Save Filter Preset</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="preset-name">Preset Name</Label>
                          <Input
                            id="preset-name"
                            value={presetName}
                            onChange={(e) => setPresetName(e.target.value)}
                            placeholder="Enter preset name..."
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsSavePresetOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSavePreset} disabled={!presetName.trim()}>
                            Save Preset
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Stages Filter */}
              <div>
                <Label className="text-sm font-medium">Stages</Label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {stages.map((stage) => (
                    <div key={stage.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`stage-${stage.id}`}
                        checked={selectedStageIds.includes(stage.id)}
                        onCheckedChange={() => handleStageToggle(stage.id)}
                      />
                      <label
                        htmlFor={`stage-${stage.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                      >
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: stage.color }}
                        />
                        {stage.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <Label className="text-sm font-medium">Priority</Label>
                <div className="mt-2 space-y-2">
                  {priorities.map((priority) => (
                    <div key={priority} className="flex items-center space-x-2">
                      <Checkbox
                        id={`priority-${priority}`}
                        checked={selectedPriorities.includes(priority)}
                        onCheckedChange={() => handlePriorityToggle(priority)}
                      />
                      <label
                        htmlFor={`priority-${priority}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                      >
                        {priority}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="mt-2 space-y-2">
                  {statuses.map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={selectedStatuses.includes(status)}
                        onCheckedChange={() => handleStatusToggle(status)}
                      />
                      <label
                        htmlFor={`status-${status}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                      >
                        {status}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assignee Filter */}
              {allAssignees.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Assigned To</Label>
                  <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                    {allAssignees.map((assignee) => (
                      <div key={assignee} className="flex items-center space-x-2">
                        <Checkbox
                          id={`assignee-${assignee}`}
                          checked={selectedAssignees.includes(assignee)}
                          onCheckedChange={() => handleAssigneeToggle(assignee)}
                        />
                        <label
                          htmlFor={`assignee-${assignee}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {assignee}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Date Range Filter */}
              <div>
                <Label className="text-sm font-medium">Date Range</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("justify-start text-left font-normal", !dateRange.start && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.start ? format(dateRange.start, "MMM dd") : "Start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.start || undefined}
                        onSelect={(date) => setDateRange({ ...dateRange, start: date || null })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("justify-start text-left font-normal", !dateRange.end && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.end ? format(dateRange.end, "MMM dd") : "End date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateRange.end || undefined}
                        onSelect={(date) => setDateRange({ ...dateRange, end: date || null })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-quikle-slate">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: {searchQuery}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery('')} />
            </Badge>
          )}
          {selectedStageIds.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Stages: {selectedStageIds.length}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedStageIds([])} />
            </Badge>
          )}
          {selectedPriorities.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Priority: {selectedPriorities.length}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedPriorities([])} />
            </Badge>
          )}
          {selectedStatuses.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Status: {selectedStatuses.length}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedStatuses([])} />
            </Badge>
          )}
          {selectedAssignees.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Assignees: {selectedAssignees.length}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedAssignees([])} />
            </Badge>
          )}
          {(dateRange.start || dateRange.end) && (
            <Badge variant="secondary" className="gap-1">
              Date range
              <X className="h-3 w-3 cursor-pointer" onClick={() => setDateRange({ start: null, end: null })} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default PipelineAdvancedFilters;
