import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomerTableContainer from '@/components/customers/table/CustomerTableContainer';

// Mock all dependencies
const mockUseCustomerData = vi.fn();
const mockUseCustomerFilters = vi.fn();
const mockUseTableSelection = vi.fn();
const mockUseCustomerExport = vi.fn();
const mockUseKeyboardShortcuts = vi.fn();

vi.mock('@/hooks/useCustomerData', () => ({
  useCustomerData: () => mockUseCustomerData(),
}));

vi.mock('@/hooks/useCustomerFilters', () => ({
  useCustomerFilters: () => mockUseCustomerFilters(),
}));

vi.mock('@/hooks/useTableSelection', () => ({
  useTableSelection: () => mockUseTableSelection(),
}));

vi.mock('@/hooks/useCustomerExport', () => ({
  useCustomerExport: () => mockUseCustomerExport(),
}));

vi.mock('@/hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: () => mockUseKeyboardShortcuts(),
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock child components
vi.mock('@/components/customers/table/CustomerTableContent', () => ({
  default: ({ paginatedCustomers, isLoading }: any) => (
    <div data-testid="customer-table-content">
      {isLoading ? 'Loading...' : `${paginatedCustomers.length} customers`}
    </div>
  ),
}));

vi.mock('@/components/customers/table/CustomerTableFilters', () => ({
  default: ({ searchQuery }: any) => (
    <div data-testid="customer-table-filters">Search: {searchQuery}</div>
  ),
}));

vi.mock('@/components/customers/QuickActionsBar', () => ({
  default: ({ shortcuts }: any) => (
    <div data-testid="quick-actions-bar">
      Shortcuts: {shortcuts.length}
    </div>
  ),
}));

vi.mock('@/components/error/ErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

interface Customer {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: Date;
}

describe('CustomerTableContainer', () => {
  const mockCustomers: Customer[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      status: 'active',
      createdAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      status: 'pending',
      createdAt: new Date('2024-01-02'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock returns
    mockUseCustomerData.mockReturnValue({
      customers: mockCustomers,
      isLoading: false,
      fetchCustomers: vi.fn(),
    });

    mockUseCustomerFilters.mockReturnValue({
      filteredCustomers: mockCustomers,
      searchQuery: '',
      setSearchQuery: vi.fn(),
      statusFilter: 'all',
      setStatusFilter: vi.fn(),
      dateRange: null,
      setDateRange: vi.fn(),
      ticketCountFilter: 'all',
      setTicketCountFilter: vi.fn(),
      sortBy: 'name',
      setSortBy: vi.fn(),
      sortOrder: 'asc',
      setSortOrder: vi.fn(),
      savedPresets: [],
      applyPreset: vi.fn(),
      saveCurrentAsPreset: vi.fn(),
      getQuickDateRange: vi.fn(),
    });

    mockUseTableSelection.mockReturnValue({
      selectedItems: new Set(),
      isAllSelected: false,
      isPartiallySelected: false,
      handleSelectAll: vi.fn(),
      handleSelectItem: vi.fn(),
      clearSelection: vi.fn(),
    });

    mockUseCustomerExport.mockReturnValue({
      handleExportCSV: vi.fn(),
      handleExportJSON: vi.fn(),
      handleExportExcel: vi.fn(),
    });

    mockUseKeyboardShortcuts.mockReturnValue([]);
  });

  it('renders all main components', () => {
    const { getByTestId } = render(<CustomerTableContainer />);
    
    expect(getByTestId('quick-actions-bar')).toBeInTheDocument();
    expect(getByTestId('customer-table-filters')).toBeInTheDocument();
    expect(getByTestId('customer-table-content')).toBeInTheDocument();
  });

  it('displays customer count correctly', () => {
    const { getByText } = render(<CustomerTableContainer />);
    
    // Should show paginated customers count (first 10 items)
    expect(getByText('2 customers')).toBeInTheDocument();
  });

  it('shows loading state when data is loading', () => {
    mockUseCustomerData.mockReturnValue({
      customers: [],
      isLoading: true,
      fetchCustomers: vi.fn(),
    });

    const { getByText } = render(<CustomerTableContainer />);
    expect(getByText('Loading...')).toBeInTheDocument();
  });

  it('handles search query correctly', () => {
    mockUseCustomerFilters.mockReturnValue({
      ...mockUseCustomerFilters(),
      searchQuery: 'John',
    });

    const { getByText } = render(<CustomerTableContainer />);
    expect(getByText('Search: John')).toBeInTheDocument();
  });

  it('sets up keyboard shortcuts', () => {
    const mockShortcuts = [
      { key: 'f', ctrlKey: true, action: vi.fn(), description: 'Focus search' },
      { key: 'a', ctrlKey: true, action: vi.fn(), description: 'Select all' },
    ];
    
    mockUseKeyboardShortcuts.mockReturnValue(mockShortcuts);

    const { getByText } = render(<CustomerTableContainer />);
    expect(getByText('Shortcuts: 2')).toBeInTheDocument();
  });

  it('handles pagination correctly', () => {
    // Create more customers to test pagination
    const manyCustomers = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Customer ${i + 1}`,
      email: `customer${i + 1}@example.com`,
      status: 'active',
      createdAt: new Date(),
    }));

    mockUseCustomerData.mockReturnValue({
      customers: manyCustomers,
      isLoading: false,
      fetchCustomers: vi.fn(),
    });

    mockUseCustomerFilters.mockReturnValue({
      ...mockUseCustomerFilters(),
      filteredCustomers: manyCustomers,
    });

    const { getByText } = render(<CustomerTableContainer />);
    
    // Should show only first 10 customers on first page
    expect(getByText('10 customers')).toBeInTheDocument();
  });

  it('handles empty customer list', () => {
    mockUseCustomerData.mockReturnValue({
      customers: [],
      isLoading: false,
      fetchCustomers: vi.fn(),
    });

    mockUseCustomerFilters.mockReturnValue({
      ...mockUseCustomerFilters(),
      filteredCustomers: [],
    });

    const { getByText } = render(<CustomerTableContainer />);
    expect(getByText('0 customers')).toBeInTheDocument();
  });

  it('handles selection state changes', () => {
    const mockHandleSelectAll = vi.fn();
    const mockHandleSelectItem = vi.fn();
    
    mockUseTableSelection.mockReturnValue({
      selectedItems: new Set(['1']),
      isAllSelected: false,
      isPartiallySelected: true,
      handleSelectAll: mockHandleSelectAll,
      handleSelectItem: mockHandleSelectItem,
      clearSelection: vi.fn(),
    });

    render(<CustomerTableContainer />);
    
    // Component should be rendered with selection state
    expect(mockUseTableSelection).toHaveBeenCalledWith(mockCustomers.slice(0, 10));
  });

  it('passes correct props to child components', () => {
    const { getByTestId } = render(<CustomerTableContainer />);
    
    // Check that props are passed correctly
    expect(getByTestId('customer-table-filters')).toBeInTheDocument();
    expect(getByTestId('customer-table-content')).toBeInTheDocument();
    expect(getByTestId('quick-actions-bar')).toBeInTheDocument();
  });
});