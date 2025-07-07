
import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from './useDebounce';

export interface PipelineFilterPreset {
  id: string;
  name: string;
  filters: {
    searchQuery: string;
    stageIds: string[];
    priority: string[];
    assignedTo: string[];
    dateRange: { start: Date | null; end: Date | null };
    status: string[];
    tags: string[];
  };
  isDefault?: boolean;
}

export interface UsePipelineFiltersProps {
  stages: any[];
  items: any[];
  type: 'customer' | 'ticket';
}

export const usePipelineFilters = ({ stages, items, type }: UsePipelineFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStageIds, setSelectedStageIds] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [savedPresets, setSavedPresets] = useState<PipelineFilterPreset[]>([
    {
      id: 'all',
      name: 'All Items',
      filters: {
        searchQuery: '',
        stageIds: [],
        priority: [],
        assignedTo: [],
        dateRange: { start: null, end: null },
        status: [],
        tags: []
      },
      isDefault: true
    },
    {
      id: 'high-priority',
      name: 'High Priority',
      filters: {
        searchQuery: '',
        stageIds: [],
        priority: ['urgent', 'high'],
        assignedTo: [],
        dateRange: { start: null, end: null },
        status: [],
        tags: []
      }
    },
    {
      id: 'recent',
      name: 'Last 7 Days',
      filters: {
        searchQuery: '',
        stageIds: [],
        priority: [],
        assignedTo: [],
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        status: [],
        tags: []
      }
    }
  ]);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filteredStages = useMemo(() => {
    return stages.map(stage => {
      const stageItems = type === 'customer' ? (stage.customers || []) : (stage.tickets || []);
      
      const filteredItems = stageItems.filter((item: any) => {
        // Search filter
        if (debouncedSearchQuery) {
          const searchFields = type === 'customer' 
            ? [item.name, item.email, item.phone].join(' ').toLowerCase()
            : [item.subject, item.ticketNumber, item.description].join(' ').toLowerCase();
          
          if (!searchFields.includes(debouncedSearchQuery.toLowerCase())) {
            return false;
          }
        }

        // Stage filter
        if (selectedStageIds.length > 0 && !selectedStageIds.includes(stage.id)) {
          return false;
        }

        // Priority filter
        if (selectedPriorities.length > 0) {
          const itemPriority = type === 'customer' ? 'medium' : item.priority;
          if (!selectedPriorities.includes(itemPriority)) {
            return false;
          }
        }

        // Assignee filter
        if (selectedAssignees.length > 0) {
          const assignee = item.assignedTo?.name || item.assigned_to_name;
          if (!assignee || !selectedAssignees.includes(assignee)) {
            return false;
          }
        }

        // Date range filter
        if (dateRange.start || dateRange.end) {
          const itemDate = new Date(item.createdAt || item.created_at);
          if (dateRange.start && itemDate < dateRange.start) return false;
          if (dateRange.end && itemDate > dateRange.end) return false;
        }

        // Status filter
        if (selectedStatuses.length > 0) {
          if (!selectedStatuses.includes(item.status)) {
            return false;
          }
        }

        return true;
      });

      return {
        ...stage,
        [type === 'customer' ? 'customers' : 'tickets']: filteredItems,
        filteredCount: filteredItems.length,
        originalCount: stageItems.length
      };
    });
  }, [
    stages,
    debouncedSearchQuery,
    selectedStageIds,
    selectedPriorities,
    selectedAssignees,
    dateRange,
    selectedStatuses,
    selectedTags,
    type
  ]);

  const applyPreset = useCallback((presetId: string) => {
    const preset = savedPresets.find(p => p.id === presetId);
    if (preset) {
      setSearchQuery(preset.filters.searchQuery);
      setSelectedStageIds(preset.filters.stageIds);
      setSelectedPriorities(preset.filters.priority);
      setSelectedAssignees(preset.filters.assignedTo);
      setDateRange(preset.filters.dateRange);
      setSelectedStatuses(preset.filters.status);
      setSelectedTags(preset.filters.tags);
    }
  }, [savedPresets]);

  const saveCurrentAsPreset = useCallback((name: string) => {
    const newPreset: PipelineFilterPreset = {
      id: `preset-${Date.now()}`,
      name,
      filters: {
        searchQuery,
        stageIds: selectedStageIds,
        priority: selectedPriorities,
        assignedTo: selectedAssignees,
        dateRange,
        status: selectedStatuses,
        tags: selectedTags
      }
    };
    setSavedPresets(prev => [...prev, newPreset]);
  }, [
    searchQuery,
    selectedStageIds,
    selectedPriorities,
    selectedAssignees,
    dateRange,
    selectedStatuses,
    selectedTags
  ]);

  const deletePreset = useCallback((presetId: string) => {
    setSavedPresets(prev => prev.filter(p => p.id !== presetId && !p.isDefault));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedStageIds([]);
    setSelectedPriorities([]);
    setSelectedAssignees([]);
    setDateRange({ start: null, end: null });
    setSelectedStatuses([]);
    setSelectedTags([]);
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery) count++;
    if (selectedStageIds.length > 0) count++;
    if (selectedPriorities.length > 0) count++;
    if (selectedAssignees.length > 0) count++;
    if (dateRange.start || dateRange.end) count++;
    if (selectedStatuses.length > 0) count++;
    if (selectedTags.length > 0) count++;
    return count;
  }, [
    searchQuery,
    selectedStageIds,
    selectedPriorities,
    selectedAssignees,
    dateRange,
    selectedStatuses,
    selectedTags
  ]);

  return {
    // Filter states
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
    selectedTags,
    setSelectedTags,
    
    // Computed values
    filteredStages,
    activeFiltersCount,
    
    // Preset management
    savedPresets,
    applyPreset,
    saveCurrentAsPreset,
    deletePreset,
    clearFilters
  };
};
