import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OnSiteStatusUpdate from '@/components/customers/OnSiteStatusUpdate';

// Mock all the hooks and components
const mockUseSecureCustomerData = vi.fn();
const mockUseCustomerSearch = vi.fn();
const mockUseLocation = vi.fn();
const mockUseSecureJobCompletion = vi.fn();

vi.mock('@/hooks/useSecureCustomerData', () => ({
  useSecureCustomerData: () => mockUseSecureCustomerData(),
}));

vi.mock('@/components/customers/onsite/hooks/useCustomerSearch', () => ({
  useCustomerSearch: () => mockUseCustomerSearch(),
}));

vi.mock('@/components/customers/onsite/hooks/useLocation', () => ({
  useLocation: () => mockUseLocation(),
}));

vi.mock('@/hooks/useSecureJobCompletion', () => ({
  useSecureJobCompletion: () => mockUseSecureJobCompletion(),
}));

// Mock all the UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardTitle: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue }: any) => <div data-testid="tabs" data-value={defaultValue}>{children}</div>,
  TabsContent: ({ children, value }: any) => <div data-testid={`tab-content-${value}`}>{children}</div>,
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value }: any) => <div data-testid={`tab-trigger-${value}`}>{children}</div>,
}));

// Mock the component imports
vi.mock('@/components/customers/onsite/components/SecureCustomerSearchInput', () => ({
  SecureCustomerSearchInput: ({ searchTerm, onSearchChange, disabled }: any) => (
    <input
      data-testid="search-input"
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      disabled={disabled}
      placeholder="Search customers..."
    />
  ),
}));

vi.mock('@/components/customers/onsite/components/CustomerDropdown', () => ({
  CustomerDropdown: ({ customers, isOpen, onCustomerSelect }: any) => (
    isOpen ? (
      <div data-testid="customer-dropdown">
        {customers.map((customer: any) => (
          <button
            key={customer.id}
            onClick={() => onCustomerSelect(customer)}
            data-testid={`customer-option-${customer.id}`}
          >
            {customer.name}
          </button>
        ))}
      </div>
    ) : null
  ),
}));

vi.mock('@/components/customers/onsite/components/SelectedCustomerCard', () => ({
  SelectedCustomerCard: ({ customer, onClear }: any) => (
    <div data-testid="selected-customer-card">
      {customer.name}
      <button onClick={onClear} data-testid="clear-selection">Clear</button>
    </div>
  ),
}));

vi.mock('@/components/customers/onsite/components/StatusSelector', () => ({
  StatusSelector: ({ value, onChange }: any) => (
    <select
      data-testid="status-selector"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="new">New</option>
      <option value="existing">Existing</option>
      <option value="pending">Pending</option>
      <option value="finalised">Finalised</option>
    </select>
  ),
}));

vi.mock('@/components/customers/onsite/components/SecureNotesInput', () => ({
  SecureNotesInput: ({ value, onChange }: any) => (
    <textarea
      data-testid="notes-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Add notes..."
    />
  ),
}));

vi.mock('@/components/customers/onsite/components/LocationIndicator', () => ({
  LocationIndicator: ({ hasLocation }: any) => (
    <div data-testid="location-indicator">
      Location: {hasLocation ? 'Available' : 'Not Available'}
    </div>
  ),
}));

vi.mock('@/components/customers/onsite/components/LoadingState', () => ({
  LoadingState: () => <div data-testid="loading-state">Loading...</div>,
}));

vi.mock('@/components/customers/onsite/components/ErrorDisplay', () => ({
  ErrorDisplay: ({ error }: any) => <div data-testid="error-display">{error}</div>,
}));

vi.mock('@/components/customers/onsite/components/TicketsTab', () => ({
  TicketsTab: ({ tickets, loading }: any) => (
    <div data-testid="tickets-tab">
      {loading ? 'Loading tickets...' : `${tickets.length} tickets`}
    </div>
  ),
}));

interface Customer {
  id: string;
  name: string;
  email: string;
  status: 'new' | 'existing' | 'pending' | 'finalised';
}

describe('OnSiteStatusUpdate', () => {
  const mockCustomers: Customer[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'existing' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'new' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock returns
    mockUseSecureCustomerData.mockReturnValue({
      customers: mockCustomers,
      loading: false,
      error: null,
      loadCustomerTickets: vi.fn().mockResolvedValue([]),
    });

    mockUseCustomerSearch.mockReturnValue({
      searchTerm: '',
      setSearchTerm: vi.fn(),
      filteredCustomers: mockCustomers,
      isDropdownOpen: false,
      setIsDropdownOpen: vi.fn(),
    });

    mockUseLocation.mockReturnValue({
      location: null,
      requestLocation: vi.fn(),
    });

    mockUseSecureJobCompletion.mockReturnValue({
      submitting: false,
      handleSubmit: vi.fn().mockResolvedValue(true),
    });
  });

  it('returns null when not open', () => {
    const { container } = render(
      <OnSiteStatusUpdate isOpen={false} onClose={vi.fn()} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('renders modal when open', () => {
    const { getByTestId } = render(
      <OnSiteStatusUpdate isOpen={true} onClose={vi.fn()} />
    );
    
    expect(getByTestId('search-input')).toBeInTheDocument();
  });

  it('shows loading state when data is loading', () => {
    mockUseSecureCustomerData.mockReturnValue({
      customers: [],
      loading: true,
      error: null,
      loadCustomerTickets: vi.fn(),
    });

    const { getByTestId } = render(
      <OnSiteStatusUpdate isOpen={true} onClose={vi.fn()} />
    );
    
    expect(getByTestId('loading-state')).toBeInTheDocument();
  });

  it('shows error when there is an error', () => {
    mockUseSecureCustomerData.mockReturnValue({
      customers: [],
      loading: false,
      error: 'Failed to load customers',
      loadCustomerTickets: vi.fn(),
    });

    const { getByTestId } = render(
      <OnSiteStatusUpdate isOpen={true} onClose={vi.fn()} />
    );
    
    expect(getByTestId('error-display')).toBeInTheDocument();
  });

  it('renders search input with correct placeholder', () => {
    const { getByPlaceholderText } = render(
      <OnSiteStatusUpdate isOpen={true} onClose={vi.fn()} />
    );
    
    expect(getByPlaceholderText('Search customers...')).toBeInTheDocument();
  });

  it('shows customer dropdown when search is active', () => {
    mockUseCustomerSearch.mockReturnValue({
      searchTerm: 'John',
      setSearchTerm: vi.fn(),
      filteredCustomers: [mockCustomers[0]],
      isDropdownOpen: true,
      setIsDropdownOpen: vi.fn(),
    });

    const { getByTestId } = render(
      <OnSiteStatusUpdate isOpen={true} onClose={vi.fn()} />
    );
    
    expect(getByTestId('customer-dropdown')).toBeInTheDocument();
    expect(getByTestId('customer-option-1')).toBeInTheDocument();
  });

  it('shows selected customer card when customer is selected', () => {
    const { getByTestId, getByText } = render(
      <OnSiteStatusUpdate isOpen={true} onClose={vi.fn()} />
    );
    
    // Simulate customer selection
    const customerOption = getByTestId('customer-option-1');
    customerOption.click();
    
    expect(getByTestId('selected-customer-card')).toBeInTheDocument();
  });

  it('renders tabs for status and tickets', () => {
    const { getByTestId } = render(
      <OnSiteStatusUpdate isOpen={true} onClose={vi.fn()} />
    );
    
    // Click customer to show tabs
    const customerOption = getByTestId('customer-option-1');
    customerOption.click();
    
    expect(getByTestId('tabs')).toBeInTheDocument();
    expect(getByTestId('tab-trigger-status')).toBeInTheDocument();
    expect(getByTestId('tab-trigger-tickets')).toBeInTheDocument();
  });

  it('shows status selector and notes input in status tab', () => {
    const { getByTestId } = render(
      <OnSiteStatusUpdate isOpen={true} onClose={vi.fn()} />
    );
    
    // Select customer to show status tab
    const customerOption = getByTestId('customer-option-1');
    customerOption.click();
    
    expect(getByTestId('status-selector')).toBeInTheDocument();
    expect(getByTestId('notes-input')).toBeInTheDocument();
    expect(getByTestId('location-indicator')).toBeInTheDocument();
  });

  it('shows tickets in tickets tab', () => {
    const { getByTestId } = render(
      <OnSiteStatusUpdate isOpen={true} onClose={vi.fn()} />
    );
    
    // Select customer to show tickets tab
    const customerOption = getByTestId('customer-option-1');
    customerOption.click();
    
    expect(getByTestId('tickets-tab')).toBeInTheDocument();
  });

  it('handles form submission correctly', () => {
    const mockHandleSubmit = vi.fn().mockResolvedValue(true);
    mockUseSecureJobCompletion.mockReturnValue({
      submitting: false,
      handleSubmit: mockHandleSubmit,
    });

    const { getByTestId, getByText } = render(
      <OnSiteStatusUpdate isOpen={true} onClose={vi.fn()} />
    );
    
    // Select customer
    const customerOption = getByTestId('customer-option-1');
    customerOption.click();
    
    // Submit form
    const submitButton = getByText('Complete Job');
    submitButton.click();
    
    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it('shows submitting state during form submission', () => {
    mockUseSecureJobCompletion.mockReturnValue({
      submitting: true,
      handleSubmit: vi.fn(),
    });

    const { getByTestId, getByText } = render(
      <OnSiteStatusUpdate isOpen={true} onClose={vi.fn()} />
    );
    
    // Select customer
    const customerOption = getByTestId('customer-option-1');
    customerOption.click();
    
    expect(getByText('Updating...')).toBeInTheDocument();
  });

  it('handles modal close correctly', () => {
    const mockOnClose = vi.fn();
    const { getByText } = render(
      <OnSiteStatusUpdate isOpen={true} onClose={mockOnClose} />
    );
    
    const cancelButton = getByText('Cancel');
    cancelButton.click();
    
    expect(mockOnClose).toHaveBeenCalled();
  });
});