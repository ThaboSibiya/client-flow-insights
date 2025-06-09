
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCustomerFilters } from '@/hooks/useCustomerFilters';
import { Customer } from '@/types/customer';

describe('useCustomerFilters', () => {
  const mockCustomers: Customer[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      status: 'new',
      notes: 'Test customer',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      activeTickets: [],
      ticketCount: 0,
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '987-654-3210',
      status: 'existing',
      notes: 'Another test customer',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      activeTickets: [],
      ticketCount: 2,
    },
  ];

  it('should filter customers by status', () => {
    const { result } = renderHook(() => useCustomerFilters(mockCustomers));

    act(() => {
      result.current.setStatusFilter('new');
    });

    expect(result.current.filteredCustomers).toHaveLength(1);
    expect(result.current.filteredCustomers[0].name).toBe('John Doe');
  });

  it('should filter customers by search query', () => {
    const { result } = renderHook(() => useCustomerFilters(mockCustomers));

    act(() => {
      result.current.setSearchQuery('jane');
    });

    // Wait for debounced search
    setTimeout(() => {
      expect(result.current.filteredCustomers).toHaveLength(1);
      expect(result.current.filteredCustomers[0].name).toBe('Jane Smith');
    }, 400);
  });

  it('should reset all filters', () => {
    const { result } = renderHook(() => useCustomerFilters(mockCustomers));

    act(() => {
      result.current.setStatusFilter('new');
      result.current.setSearchQuery('test');
    });

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.statusFilter).toBe('all');
    expect(result.current.searchQuery).toBe('');
    expect(result.current.filteredCustomers).toHaveLength(2);
  });

  it('should sort customers by name', () => {
    const { result } = renderHook(() => useCustomerFilters(mockCustomers));

    act(() => {
      result.current.setSortBy('name');
      result.current.setSortOrder('asc');
    });

    expect(result.current.filteredCustomers[0].name).toBe('Jane Smith');
    expect(result.current.filteredCustomers[1].name).toBe('John Doe');
  });
});
