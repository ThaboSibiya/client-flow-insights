
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useCustomerExport } from '@/hooks/useCustomerExport';
import { Customer } from '@/types/customer';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock the export utils
vi.mock('@/utils/exportUtils', () => ({
  exportCustomers: vi.fn(),
}));

describe('useCustomerExport', () => {
  const mockCustomers: Customer[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      status: 'new',
      notes: 'Test customer',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
      activeTickets: [],
      ticketCount: 0,
      user_id: 'user-1'
    },
  ];

  it('should export filtered customers when no selection', () => {
    const { result } = renderHook(() =>
      useCustomerExport({
        customers: mockCustomers,
        filteredCustomers: mockCustomers,
        selectedCustomers: new Set(),
      })
    );

    expect(result.current.getExportCount()).toBe(1);
  });

  it('should export selected customers when there is a selection', () => {
    const { result } = renderHook(() =>
      useCustomerExport({
        customers: mockCustomers,
        filteredCustomers: mockCustomers,
        selectedCustomers: new Set(['1']),
      })
    );

    expect(result.current.getExportCount()).toBe(1);
  });
});
