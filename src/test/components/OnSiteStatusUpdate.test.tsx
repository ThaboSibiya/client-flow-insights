import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OnSiteStatusUpdate from '@/components/customers/OnSiteStatusUpdate';

// Mock all the hooks
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

vi.mock('@/utils/securityUtils', () => ({
  sanitizeInput: (val: string) => val,
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className }: any) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

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
    <select data-testid="status-selector" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="existing">Existing</option>
      <option value="pending">Pending</option>
      <option value="finalised">Finalised</option>
    </select>
  ),
}));

vi.mock('@/components/customers/onsite/components/SecureNotesInput', () => ({
  SecureNotesInput: ({ value, onChange }: any) => (
    <textarea data-testid="notes-input" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

vi.mock('@/components/customers/onsite/components/LocationIndicator', () => ({
  LocationIndicator: ({ hasLocation }: any) => (
    <div data-testid="location-indicator">Location: {hasLocation ? 'Yes' : 'No'}</div>
  ),
}));

vi.mock('@/components/customers/onsite/components/LoadingState', () => ({
  LoadingState: () => <div data-testid="loading-state">Loading...</div>,
}));

vi.mock('@/components/customers/onsite/components/ErrorDisplay', () => ({
  ErrorDisplay: ({ error }: any) => <div data-testid="error-display">{error}</div>,
}));

vi.mock('@/components/customers/onsite/components/TicketSelector', () => ({
  TicketSelector: ({ tickets, loading }: any) => (
    <div data-testid="ticket-selector">
      {loading ? 'Loading...' : `${tickets.length} tickets`}
    </div>
  ),
}));

vi.mock('@/components/customers/onsite/components/PhotoUploader', () => ({
  PhotoUploader: () => <div data-testid="photo-uploader">Photos</div>,
}));

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'new' | 'existing' | 'pending' | 'finalised';
  notes: string;
}

describe('OnSiteStatusUpdate', () => {
  const mockCustomers: Customer[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', phone: '123', status: 'existing', notes: '' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '456', status: 'new', notes: '' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
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

  it('shows loading state', () => {
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

  it('shows error state', () => {
    mockUseSecureCustomerData.mockReturnValue({
      customers: [],
      loading: false,
      error: 'Failed to load',
      loadCustomerTickets: vi.fn(),
    });

    const { getByTestId } = render(
      <OnSiteStatusUpdate isOpen={true} onClose={vi.fn()} />
    );
    expect(getByTestId('error-display')).toBeInTheDocument();
  });

  it('shows unified form after customer selection', () => {
    mockUseCustomerSearch.mockReturnValue({
      searchTerm: '',
      setSearchTerm: vi.fn(),
      filteredCustomers: mockCustomers,
      isDropdownOpen: true,
      setIsDropdownOpen: vi.fn(),
    });

    const { getByTestId } = render(
      <OnSiteStatusUpdate isOpen={true} onClose={vi.fn()} />
    );

    // Select customer
    getByTestId('customer-option-1').click();

    // All unified form sections should render
    expect(getByTestId('selected-customer-card')).toBeInTheDocument();
    expect(getByTestId('ticket-selector')).toBeInTheDocument();
    expect(getByTestId('status-selector')).toBeInTheDocument();
    expect(getByTestId('photo-uploader')).toBeInTheDocument();
    expect(getByTestId('notes-input')).toBeInTheDocument();
  });

  it('calls handleSubmit with payload on complete', () => {
    const mockHandleSubmit = vi.fn().mockResolvedValue(true);
    mockUseSecureJobCompletion.mockReturnValue({
      submitting: false,
      handleSubmit: mockHandleSubmit,
    });

    mockUseCustomerSearch.mockReturnValue({
      searchTerm: '',
      setSearchTerm: vi.fn(),
      filteredCustomers: mockCustomers,
      isDropdownOpen: true,
      setIsDropdownOpen: vi.fn(),
    });

    const { getByTestId, getByText } = render(
      <OnSiteStatusUpdate isOpen={true} onClose={vi.fn()} />
    );

    getByTestId('customer-option-1').click();
    getByText('Complete Job').click();

    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it('shows completing state during submission', () => {
    mockUseSecureJobCompletion.mockReturnValue({
      submitting: true,
      handleSubmit: vi.fn(),
    });

    mockUseCustomerSearch.mockReturnValue({
      searchTerm: '',
      setSearchTerm: vi.fn(),
      filteredCustomers: mockCustomers,
      isDropdownOpen: true,
      setIsDropdownOpen: vi.fn(),
    });

    const { getByTestId, getByText } = render(
      <OnSiteStatusUpdate isOpen={true} onClose={vi.fn()} />
    );

    getByTestId('customer-option-1').click();
    expect(getByText('Completing...')).toBeInTheDocument();
  });

  it('handles cancel correctly', () => {
    const mockOnClose = vi.fn();
    const { getByText } = render(
      <OnSiteStatusUpdate isOpen={true} onClose={mockOnClose} />
    );
    
    getByText('Cancel').click();
    expect(mockOnClose).toHaveBeenCalled();
  });
});
