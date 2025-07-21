
import { useState, useMemo } from 'react';
import { Customer } from '@/types/customer';

export interface FilterState {
  search: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const useCustomerFilters = (customers: Customer[]) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    sortBy: 'name',
    sortOrder: 'asc'
  });

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

        return basicSearch || ticketSearch;
      });
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(customer => customer.status === filters.status);
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
  }, [customers, filters]);

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
  };

  return {
    filters,
    filteredAndSortedCustomers,
    updateFilter,
    resetFilters
  };
};
