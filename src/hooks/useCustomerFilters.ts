
import { useState, useMemo } from 'react';
import { Customer } from '@/types/customer';

export interface FilterState {
  search: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: any;
}

export const useCustomerFilters = (customers: Customer[]) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });

  const [ticketCountFilter, setTicketCountFilter] = useState<string>('all');
  const [savedPresets] = useState<FilterPreset[]>([]);

  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = customers;

    // Apply search filter - now includes template data search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = customers.filter(customer => {
        // Basic customer info search
        const basicSearch = [
          customer.name,
          customer.email,
          customer.phone,
          customer.address,
          customer.notes,
          customer.status,
          customer.territory,
          customer.assigned_to_email
        ].some(field => 
          field?.toLowerCase().includes(searchTerm)
        );

        // Ticket-related search
        const ticketSearch = customer.activeTickets?.some(ticket => [
          ticket.ticketNumber,
          ticket.subject,
          ticket.description,
          ticket.priority,
          ticket.status,
          ticket.assignedTo?.name,
          ticket.assignedTo?.email,
          // Search in time entries
          ...ticket.timeEntries.map(entry => [
            entry.description,
            entry.userName
          ]).flat()
        ].some(field => 
          field?.toLowerCase().includes(searchTerm)
        )) || false;

        // Template data search
        const templateSearch = customer.templateData?.some(template =>
          Object.values(template.fieldValues || {}).some(value =>
            String(value).toLowerCase().includes(searchTerm)
          )
        ) || false;

        return basicSearch || ticketSearch || templateSearch;
      });
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(customer => customer.status === filters.status);
    }

    // Apply date range filter
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter(customer => {
        const createdAt = new Date(customer.createdAt);
        if (dateRange.start && createdAt < dateRange.start) return false;
        if (dateRange.end && createdAt > dateRange.end) return false;
        return true;
      });
    }

    // Apply ticket count filter
    if (ticketCountFilter !== 'all') {
      filtered = filtered.filter(customer => {
        const ticketCount = customer.ticketCount || 0;
        switch (ticketCountFilter) {
          case 'with-tickets':
            return ticketCount > 0;
          case 'no-tickets':
            return ticketCount === 0;
          case 'urgent-tickets':
            return customer.activeTickets?.some(ticket => ticket.priority === 'urgent') || false;
          case 'open-tickets':
            return customer.activeTickets?.some(ticket => ticket.status === 'open') || false;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'ticketCount':
          aValue = a.ticketCount || 0;
          bValue = b.ticketCount || 0;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [customers, filters, dateRange, ticketCountFilter]);

  const updateFilter = (key: keyof FilterState, value: string | 'asc' | 'desc') => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      sortBy: 'name',
      sortOrder: 'asc'
    });
    setDateRange({ start: null, end: null });
    setTicketCountFilter('all');
  };

  const applyPreset = (preset: FilterPreset) => {
    // Implementation for applying presets
    console.log('Applying preset:', preset);
  };

  const saveCurrentAsPreset = (name: string) => {
    // Implementation for saving current filters as preset
    console.log('Saving preset:', name);
  };

  const getQuickDateRange = (range: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (range) {
      case 'today':
        setDateRange({ start: today, end: now });
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        setDateRange({ start: weekAgo, end: now });
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        setDateRange({ start: monthAgo, end: now });
        break;
      case 'quarter':
        const quarterAgo = new Date(today);
        quarterAgo.setMonth(quarterAgo.getMonth() - 3);
        setDateRange({ start: quarterAgo, end: now });
        break;
      default:
        break;
    }
  };

  return {
    filters,
    filteredAndSortedCustomers,
    filteredCustomers: filteredAndSortedCustomers, // Alias for backward compatibility
    searchQuery: filters.search,
    setSearchQuery: (query: string) => updateFilter('search', query),
    statusFilter: filters.status,
    setStatusFilter: (status: string) => updateFilter('status', status),
    dateRange,
    setDateRange,
    ticketCountFilter,
    setTicketCountFilter,
    sortBy: filters.sortBy,
    setSortBy: (sortBy: string) => updateFilter('sortBy', sortBy),
    sortOrder: filters.sortOrder,
    setSortOrder: (sortOrder: 'asc' | 'desc') => updateFilter('sortOrder', sortOrder),
    savedPresets,
    applyPreset,
    saveCurrentAsPreset,
    getQuickDateRange,
    updateFilter,
    resetFilters
  };
};
