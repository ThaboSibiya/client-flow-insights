
import { useState, useMemo, useCallback } from 'react';
import { Customer } from '@/types/customer';
import { useDebounce } from '../useDebounce';
import { createFilterFunctions } from './filterFunctions';
import { createSortFunction } from './sortFunctions';
import { DEFAULT_PRESETS } from './presets';
import { FilterPreset, UseCustomerFiltersReturn } from './types';
import { getDateRange } from '@/utils/dateUtils';

export const useCustomerFilters = (customers: Customer[]): UseCustomerFiltersReturn => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [ticketFilter, setTicketFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{start: Date | null, end: Date | null}>({start: null, end: null});
  const [savedPresets, setSavedPresets] = useState<FilterPreset[]>(DEFAULT_PRESETS);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filterFunctions = useMemo(() => 
    createFilterFunctions(statusFilter, debouncedSearchQuery, dateRange, ticketFilter),
    [statusFilter, debouncedSearchQuery, dateRange, ticketFilter]
  );

  const sortFunction = useMemo(() => 
    createSortFunction(sortBy, sortOrder),
    [sortBy, sortOrder]
  );

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

  const deleteFilterPreset = useCallback((presetId: string) => {
    setSavedPresets(prev => prev.filter(p => p.id !== presetId));
  }, []);

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
    deleteFilterPreset,
    getQuickDateRange: handleQuickDateRange,
  };
};

export type { FilterPreset, UseCustomerFiltersReturn };
