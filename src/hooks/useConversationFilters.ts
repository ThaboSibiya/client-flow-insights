
import { useState, useMemo } from 'react';

interface ConversationFilters {
  type: string;
  status: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  assignedTo: string;
  searchQuery: string;
}

interface SortOptions {
  field: 'last_message_at' | 'created_at' | 'subject' | 'unread_count';
  direction: 'asc' | 'desc';
}

export const useConversationFilters = () => {
  const [filters, setFilters] = useState<ConversationFilters>({
    type: 'all',
    status: 'all',
    dateRange: { from: null, to: null },
    assignedTo: 'all',
    searchQuery: '',
  });

  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'last_message_at',
    direction: 'desc',
  });

  const updateFilter = (key: keyof ConversationFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const updateSort = (field: SortOptions['field'], direction?: SortOptions['direction']) => {
    setSortOptions(prev => ({
      field,
      direction: direction || (prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'),
    }));
  };

  const resetFilters = () => {
    setFilters({
      type: 'all',
      status: 'all',
      dateRange: { from: null, to: null },
      assignedTo: 'all',
      searchQuery: '',
    });
    setSortOptions({
      field: 'last_message_at',
      direction: 'desc',
    });
  };

  const filterAndSortConversations = (conversations: any[]) => {
    if (!conversations) return [];

    let filtered = conversations.filter(conv => {
      // Type filter
      if (filters.type !== 'all' && conv.type !== filters.type) return false;
      
      // Status filter
      if (filters.status !== 'all' && conv.status !== filters.status) return false;
      
      // Date range filter
      if (filters.dateRange.from && new Date(conv.created_at) < filters.dateRange.from) return false;
      if (filters.dateRange.to && new Date(conv.created_at) > filters.dateRange.to) return false;
      
      // Assigned to filter
      if (filters.assignedTo !== 'all') {
        if (filters.assignedTo === 'unassigned') {
          if (conv.employee_id) return false;
        } else {
          if (conv.employee_id !== filters.assignedTo) return false;
        }
      }
      
      // Search query filter
      if (filters.searchQuery) {
        const searchLower = filters.searchQuery.toLowerCase();
        return (
          conv.subject?.toLowerCase().includes(searchLower) ||
          conv.customer_id?.toLowerCase().includes(searchLower) ||
          conv.employee_id?.toLowerCase().includes(searchLower) ||
          conv.last_message_preview?.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    });

    // Sort conversations
    filtered.sort((a, b) => {
      const aValue = a[sortOptions.field];
      const bValue = b[sortOptions.field];
      
      if (aValue === null) return 1;
      if (bValue === null) return -1;
      
      let comparison = 0;
      
      if (sortOptions.field === 'unread_count') {
        comparison = (aValue || 0) - (bValue || 0);
      } else if (sortOptions.field === 'last_message_at' || sortOptions.field === 'created_at') {
        comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }
      
      return sortOptions.direction === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.type !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.assignedTo !== 'all') count++;
    if (filters.searchQuery) count++;
    return count;
  }, [filters]);

  return {
    filters,
    sortOptions,
    updateFilter,
    updateSort,
    resetFilters,
    filterAndSortConversations,
    activeFiltersCount,
  };
};
