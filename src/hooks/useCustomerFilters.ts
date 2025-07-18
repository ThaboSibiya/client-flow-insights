
import { useState, useMemo, useCallback } from 'react';
import { Customer } from '@/types/customer';
import { useDebounce } from './useDebounce';
import { getDateRange } from '@/utils/dateUtils';

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
      dateRange: getDateRange('week'),
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

  // Memoize filter functions for better performance
  const filterFunctions = useMemo(() => ({
    status: (customer: Customer) => statusFilter === 'all' || customer.status === statusFilter,
    search: (customer: Customer) => {
      if (!debouncedSearchQuery) return true;
      const query = debouncedSearchQuery.toLowerCase();
      return customer.name.toLowerCase().includes(query) ||
             customer.email.toLowerCase().includes(query) ||
             customer.phone.toLowerCase().includes(query);
    },
    dateRange: (customer: Customer) => {
      if (!dateRange.start && !dateRange.end) return true;
      if (dateRange.start && customer.createdAt < dateRange.start) return false;
      if (dateRange.end && customer.createdAt > dateRange.end) return false;
      return true;
    },
    ticket: (customer: Customer) => {
      switch (ticketFilter) {
        case 'with-tickets':
          return customer.ticketCount > 0;
        case 'no-tickets':
          return customer.ticketCount === 0;
        case 'urgent-tickets':
          return customer.activeTickets?.some(t => t.priority === 'urgent' && t.status !== 'closed') || false;
        case 'open-tickets':
          return customer.activeTickets?.some(t => t.status === 'open' || t.status === 'in-progress') || false;
        default:
          return true;
      }
    }
  }), [statusFilter, debouncedSearchQuery, dateRange, ticketFilter]);

  // Memoize sort function
  const sortFunction = useMemo(() => {
    return (a: Customer, b: Customer) => {
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
    };
  }, [sortBy, sortOrder]);

  // Memoized filtered and sorted customers
  const filteredCustomers = useMemo(() => {
    const filtered = customers.filter(customer => 
      filterFunctions.status(customer) &&
      filterFunctions.search(customer) &&
      filterFunctions.dateRange(customer) &&
      filterFunctions.ticket(customer)
    );

    return filtered.sort(sortFunction);
  }, [customers, filterFunctions, sortFunction]);

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

  const handleQuickDateRange = useCallback((range: string) => {
    const newRange = getDateRange(range);
    setDateRange(newRange);
  }, []);

  const resetFilters = useCallback(() => {
    setStatusFilter('all');
    setSearchQuery('');
    setTicketFilter('all');
    setDateRange({ start: null, end: null });
    setSortBy('name');
    setSortOrder('asc');
  }, []);

  // Memoize active filters calculation
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
    setTicketFilter,
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
    getQuickDateRange: handleQuickDateRange,
  };
};
