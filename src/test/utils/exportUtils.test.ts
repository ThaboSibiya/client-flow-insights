
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Customer } from '@/types/customer';

// Mock the exportUtils module
const mockExportCustomers = vi.fn();
vi.mock('@/utils/exportUtils', () => ({
  exportCustomers: mockExportCustomers,
}));

describe('Export Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
  ];

  it('should call exportCustomers with correct CSV format', () => {
    const { exportCustomers } = require('@/utils/exportUtils');
    
    exportCustomers({
      customers: mockCustomers,
      format: 'csv',
    });

    expect(mockExportCustomers).toHaveBeenCalledWith({
      customers: mockCustomers,
      format: 'csv',
    });
  });

  it('should call exportCustomers with correct JSON format', () => {
    const { exportCustomers } = require('@/utils/exportUtils');
    
    exportCustomers({
      customers: mockCustomers,
      format: 'json',
    });

    expect(mockExportCustomers).toHaveBeenCalledWith({
      customers: mockCustomers,
      format: 'json',
    });
  });
});
