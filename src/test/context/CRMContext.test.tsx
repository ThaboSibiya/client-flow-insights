import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CRMProvider, useCRM } from '@/context/CRMContext';

// Mock all dependencies
const mockUseCustomerData = vi.fn();
const mockUseCustomerStore = vi.fn();
const mockUseTicketStore = vi.fn();
const mockUseOptimisticUpdates = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('@/hooks/useCustomerData', () => ({
  useCustomerData: () => mockUseCustomerData(),
}));

vi.mock('@/stores/customerStore', () => ({
  useCustomerStore: () => mockUseCustomerStore(),
}));

vi.mock('@/stores/ticketStore', () => ({
  useTicketStore: () => mockUseTicketStore(),
}));

vi.mock('@/hooks/useOptimisticUpdates', () => ({
  useOptimisticUpdates: () => mockUseOptimisticUpdates(),
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock services
vi.mock('@/services/customerService', () => ({
  addCustomer: vi.fn().mockResolvedValue({ id: 'new-customer', name: 'Test Customer' }),
  updateCustomerStatus: vi.fn().mockResolvedValue(true),
  updateCustomer: vi.fn().mockResolvedValue(true),
  deleteCustomer: vi.fn().mockResolvedValue(true),
}));

// Test component that uses CRM context
const TestConsumer = () => {
  const {
    customers,
    addCustomer,
    updateCustomerStatus,
    updateCustomer,
    deleteCustomer,
    createTicket,
    updateTicketStatus,
    addTimeEntry,
  } = useCRM();

  return (
    <div>
      <div data-testid="customer-count">{customers.length}</div>
      <button onClick={() => addCustomer({
        name: 'New Customer',
        email: 'new@example.com',
        phone: '123-456-7890',
        status: 'new',
        notes: ''
      })} data-testid="add-customer">Add Customer</button>
      <button onClick={() => updateCustomerStatus('1', 'existing')} data-testid="update-status">Update Status</button>
      <button onClick={() => updateCustomer('1', { name: 'Updated Name' })} data-testid="update-customer">Update Customer</button>
      <button onClick={() => deleteCustomer('1')} data-testid="delete-customer">Delete Customer</button>
      <button onClick={() => createTicket('1', {
        status: 'open',
        priority: 'medium',
        subject: 'Test Ticket',
        timeEntries: [],
        totalTimeSpent: 0
      })} data-testid="create-ticket">Create Ticket</button>
      <button onClick={() => updateTicketStatus('ticket-1', 'resolved')} data-testid="update-ticket">Update Ticket</button>
      <button onClick={() => addTimeEntry('ticket-1', {
        userId: 'user-1',
        userName: 'Test User',
        description: 'Work done',
        duration: 60,
        startTime: new Date(),
        endTime: new Date()
      })} data-testid="add-time">Add Time</button>
    </div>
  );
};

interface MockCustomer {
  id: string;
  name: string;
  email: string;
  status: string;
  activeTickets?: any[];
  ticketCount?: number;
}

describe('CRMContext', () => {
  const mockCustomers: MockCustomer[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'new' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'existing' },
  ];

  const mockCustomerStore = {
    customers: mockCustomers,
    setCustomers: vi.fn(),
    setError: vi.fn(),
    optimisticUpdateCustomer: vi.fn(),
  };

  const mockTicketStore = {
    optimisticAddTicket: vi.fn(),
  };

  const mockOptimisticUpdates = {
    updateCustomerOptimistically: vi.fn(),
    deleteCustomerOptimistically: vi.fn(),
    updateTicketOptimistically: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseCustomerData.mockReturnValue({
      fetchCustomers: vi.fn(),
    });
    
    mockUseCustomerStore.mockReturnValue(mockCustomerStore);
    mockUseTicketStore.mockReturnValue(mockTicketStore);
    mockUseOptimisticUpdates.mockReturnValue(mockOptimisticUpdates);
    
    mockUseAuth.mockReturnValue({
      user: { id: 'user123' },
    });
  });

  it('provides customer data from store', () => {
    const { getByTestId } = render(
      <CRMProvider>
        <TestConsumer />
      </CRMProvider>
    );
    
    expect(getByTestId('customer-count')).toHaveTextContent('2');
  });

  it('throws error when used outside provider', () => {
    // Mock console.error to suppress error output in test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => render(<TestConsumer />)).toThrow(
      'useCRM must be used within a CRMProvider'
    );
    
    consoleSpy.mockRestore();
  });

  it('handles add customer action', async () => {
    const { getByTestId } = render(
      <CRMProvider>
        <TestConsumer />
      </CRMProvider>
    );
    
    const addButton = getByTestId('add-customer');
    addButton.click();
    
    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(mockCustomerStore.setCustomers).toHaveBeenCalled();
  });

  it('handles update customer status action', () => {
    const { getByTestId } = render(
      <CRMProvider>
        <TestConsumer />
      </CRMProvider>
    );
    
    const updateButton = getByTestId('update-status');
    updateButton.click();
    
    expect(mockOptimisticUpdates.updateCustomerOptimistically).toHaveBeenCalledWith(
      '1',
      { status: 'existing' },
      expect.any(Function)
    );
  });

  it('handles update customer action', () => {
    const { getByTestId } = render(
      <CRMProvider>
        <TestConsumer />
      </CRMProvider>
    );
    
    const updateButton = getByTestId('update-customer');
    updateButton.click();
    
    expect(mockOptimisticUpdates.updateCustomerOptimistically).toHaveBeenCalledWith(
      '1',
      { name: 'Updated Name' },
      expect.any(Function)
    );
  });

  it('handles delete customer action', () => {
    const { getByTestId } = render(
      <CRMProvider>
        <TestConsumer />
      </CRMProvider>
    );
    
    const deleteButton = getByTestId('delete-customer');
    deleteButton.click();
    
    expect(mockOptimisticUpdates.deleteCustomerOptimistically).toHaveBeenCalledWith(
      '1',
      expect.any(Function)
    );
  });

  it('handles create ticket action', () => {
    const { getByTestId } = render(
      <CRMProvider>
        <TestConsumer />
      </CRMProvider>
    );
    
    const createButton = getByTestId('create-ticket');
    createButton.click();
    
    expect(mockTicketStore.optimisticAddTicket).toHaveBeenCalled();
    expect(mockCustomerStore.optimisticUpdateCustomer).toHaveBeenCalled();
  });

  it('handles update ticket status action', () => {
    const { getByTestId } = render(
      <CRMProvider>
        <TestConsumer />
      </CRMProvider>
    );
    
    const updateButton = getByTestId('update-ticket');
    updateButton.click();
    
    expect(mockOptimisticUpdates.updateTicketOptimistically).toHaveBeenCalledWith(
      'ticket-1',
      expect.objectContaining({ status: 'resolved' }),
      expect.any(Function)
    );
  });

  it('handles add time entry action', () => {
    const { getByTestId } = render(
      <CRMProvider>
        <TestConsumer />
      </CRMProvider>
    );
    
    const addTimeButton = getByTestId('add-time');
    addTimeButton.click();
    
    expect(mockOptimisticUpdates.updateTicketOptimistically).toHaveBeenCalled();
  });

  it('does not perform actions when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null });
    
    const { getByTestId } = render(
      <CRMProvider>
        <TestConsumer />
      </CRMProvider>
    );
    
    const addButton = getByTestId('add-customer');
    addButton.click();
    
    expect(mockCustomerStore.setCustomers).not.toHaveBeenCalled();
  });

  it('handles errors in add customer correctly', async () => {
    // Mock service to throw error
    const mockAddCustomerService = vi.fn().mockRejectedValue(new Error('Service error'));
    vi.doMock('@/services/customerService', () => ({
      addCustomer: mockAddCustomerService,
    }));
    
    const { getByTestId } = render(
      <CRMProvider>
        <TestConsumer />
      </CRMProvider>
    );
    
    const addButton = getByTestId('add-customer');
    addButton.click();
    
    // Wait for async operation
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(mockCustomerStore.setError).toHaveBeenCalledWith('Failed to add customer');
  });

  it('provides all required context methods', () => {
    const TestMethodChecker = () => {
      const context = useCRM();
      
      return (
        <div>
          <div data-testid="has-customers">{Array.isArray(context.customers) ? 'true' : 'false'}</div>
          <div data-testid="has-add-customer">{typeof context.addCustomer === 'function' ? 'true' : 'false'}</div>
          <div data-testid="has-update-status">{typeof context.updateCustomerStatus === 'function' ? 'true' : 'false'}</div>
          <div data-testid="has-update-customer">{typeof context.updateCustomer === 'function' ? 'true' : 'false'}</div>
          <div data-testid="has-delete-customer">{typeof context.deleteCustomer === 'function' ? 'true' : 'false'}</div>
          <div data-testid="has-create-ticket">{typeof context.createTicket === 'function' ? 'true' : 'false'}</div>
          <div data-testid="has-update-ticket">{typeof context.updateTicketStatus === 'function' ? 'true' : 'false'}</div>
          <div data-testid="has-add-time">{typeof context.addTimeEntry === 'function' ? 'true' : 'false'}</div>
        </div>
      );
    };
    
    const { getByTestId } = render(
      <CRMProvider>
        <TestMethodChecker />
      </CRMProvider>
    );
    
    expect(getByTestId('has-customers')).toHaveTextContent('true');
    expect(getByTestId('has-add-customer')).toHaveTextContent('true');
    expect(getByTestId('has-update-status')).toHaveTextContent('true');
    expect(getByTestId('has-update-customer')).toHaveTextContent('true');
    expect(getByTestId('has-delete-customer')).toHaveTextContent('true');
    expect(getByTestId('has-create-ticket')).toHaveTextContent('true');
    expect(getByTestId('has-update-ticket')).toHaveTextContent('true');
    expect(getByTestId('has-add-time')).toHaveTextContent('true');
  });
});