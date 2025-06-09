
import { useState, useMemo, useCallback } from 'react';
import { Customer } from '@/types/customer';
import { useDebounce } from './useDebounce';

export interface FilterPreset {
  id: string;
  name: string;
  filters: {
    status: string;
    ticketFilter: string;
    dateRange: { start: Date | null; end: Date | null };
    searchQuery: string;
  };
}

const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'new-customers',
    name: 'New Customers',
    filters: {
      status: 'new',
      ticketFilter: 'all',
      dateRange: { start: null, end: null },
      searchQuery: '',
    },
  },
  {
    id: 'urgent-tickets',
    name: 'Urgent Tickets',
    filters: {
      status: 'all',
      ticketFilter: 'urgent-tickets',
      dateRange: { start: null, end: null },
      searchQuery: '',
    },
  },
  {
    id: 'recent-customers',
    name: 'Last 7 Days',
    filters: {
      status: 'all',
      ticketFilter: 'all',
      dateRange: { 
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
        end: new Date() 
      },
      searchQuery: '',
    },
  },
];

export const useCustomerFilters = (customers: Customer[]) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [ticketFilter, setTicketFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{start: Date | null, end: Date | null}>({start: null, end: null});
  const [savedPresets, setSavedPresets] = useState<FilterPreset[]>(DEFAULT_PRESETS);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Debounce search query to reduce unnecessary filtering
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filteredCustomers = useMemo(() => {
    let result = customers.filter(customer => {
      // Status filter
      if (statusFilter !== 'all' && customer.status !== statusFilter) return false;
      
      // Search filter (debounced)
      if (debouncedSearchQuery && 
          !customer.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) &&
          !customer.email.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) &&
          !customer.phone.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) return false;
      
      // Date range filter
      if (dateRange.start && customer.createdAt < dateRange.start) return false;
      if (dateRange.end && customer.createdAt > dateRange.end) return false;
      
      // Ticket filter
      switch (ticketFilter) {
        case 'with-tickets':
          if (customer.ticketCount === 0) return false;
          break;
        case 'no-tickets':
          if (customer.ticketCount > 0) return false;
          break;
        case 'urgent-tickets':
          if (!customer.activeTickets?.some(t => t.priority === 'urgent' && t.status !== 'closed')) return false;
          break;
        case 'open-tickets':
          if (!customer.activeTickets?.some(t => t.status === 'open' || t.status === 'in-progress')) return false;
          break;
      }
      
      return true;
    });

    // Sort the results
    result.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'createdAt':
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [customers, statusFilter, debouncedSearchQuery, dateRange, ticketFilter, sortBy, sortOrder]);

  const applyPreset = useCallback((presetId: string) => {
    const preset = savedPresets.find(p => p.id === presetId);
    if (preset) {
      setStatusFilter(preset.filters.status);
      setSearchQuery(preset.filters.searchQuery);
      setTicketFilter(preset.filters.ticketFilter);
      setDateRange(preset.filters.dateRange);
    }
  }, [savedPresets]);

  const saveCurrentAsPreset = useCallback((name: string) => {
    const newPreset: FilterPreset = {
      id: `custom-${Date.now()}`,
      name,
      filters: {
        status: statusFilter,
        ticketFilter,
        dateRange,
        searchQuery,
      },
    };
    setSavedPresets(prev => [...prev, newPreset]);
  }, [statusFilter, ticketFilter, dateRange, searchQuery]);

  const getQuickDateRange = useCallback((range: string) => {
    const now = new Date();
    switch (range) {
      case 'today':
        return { start: new Date(now.getFullYear(), now.getMonth(), now.getDate()), end: now };
      case 'week':
        return { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: now };
      case 'month':
        return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        return { start: new Date(now.getFullYear(), quarter * 3, 1), end: now };
      default:
        return { start: null, end: null };
    }
  }, []);

  const resetFilters = useCallback(() => {
    setStatusFilter('all');
    setSearchQuery('');
    setTicketFilter('all');
    setDateRange({ start: null, end: null });
    setSortBy('name');
    setSortOrder('asc');
  }, []);

  const activeFilters = useMemo(() => {
    const filters = [];
    if (statusFilter !== 'all') filters.push(`Status: ${statusFilter}`);
    if (searchQuery) filters.push(`Search: ${searchQuery}`);
    if (ticketFilter !== 'all') filters.push(`Tickets: ${ticketFilter}`);
    if (dateRange.start || dateRange.end) filters.push('Date range');
    return filters;
  }, [statusFilter, searchQuery, ticketFilter, dateRange]);

  return {
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    ticketFilter,
    setTicketFilter: setTicketFilter,
    ticketCountFilter: ticketFilter,
    setTicketCountFilter: setTicketFilter,
    dateRange,
    setDateRange,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    resetFilters,
    activeFilters,
    filteredCustomers,
    savedPresets,
    applyPreset,
    loadFilterPreset: applyPreset,
    saveCurrentAsPreset,
    saveFilterPreset: saveCurrentAsPreset,
    deleteFilterPreset: (presetId: string) => {
      setSavedPresets(prev => prev.filter(p => p.id !== presetId));
    },
    getQuickDateRange,
  };
};
