
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomerTable from '@/components/customers/CustomerTable';

// Mock the CRM context
const mockUseCRM = {
  customers: [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '123-456-7890',
      status: 'new' as const,
      notes: 'Test customer',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      activeTickets: [],
      ticketCount: 0,
    },
  ],
  addCustomer: vi.fn(),
  updateCustomerStatus: vi.fn(),
  updateCustomer: vi.fn(),
  deleteCustomer: vi.fn(),
  createTicket: vi.fn(),
  updateTicketStatus: vi.fn(),
  addTimeEntry: vi.fn(),
};

vi.mock('@/context/CRMContext', () => ({
  useCRM: () => mockUseCRM,
}));

describe('Customer Management Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display customers in the table', async () => {
    render(<CustomerTable />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  it('should filter customers by search query', async () => {
    const user = userEvent.setup();
    render(<CustomerTable />);

    const searchInput = screen.getByPlaceholderText(/search customers/i);
    await user.type(searchInput, 'John');

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should handle customer status change', async () => {
    const user = userEvent.setup();
    render(<CustomerTable />);

    // Find the status dropdown for the customer
    const statusButton = screen.getByRole('button', { name: /new/i });
    await user.click(statusButton);

    // Select a new status
    const existingOption = screen.getByText('Existing');
    await user.click(existingOption);

    expect(mockUseCRM.updateCustomerStatus).toHaveBeenCalledWith('1', 'existing');
  });

  it('should handle bulk actions', async () => {
    const user = userEvent.setup();
    render(<CustomerTable />);

    // Select a customer
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    // Wait for bulk actions to appear
    await waitFor(() => {
      expect(screen.getByText(/selected/i)).toBeInTheDocument();
    });

    // Use bulk status change
    const statusSelect = screen.getByRole('combobox');
    await user.click(statusSelect);
    
    const finalizedOption = screen.getByText('Mark as Finalised');
    await user.click(finalizedOption);

    expect(mockUseCRM.updateCustomerStatus).toHaveBeenCalled();
  });
});
