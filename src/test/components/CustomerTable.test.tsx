import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomerTable from '@/components/customers/CustomerTable';

// Mock the CustomerTableContainer
vi.mock('@/components/customers/table/CustomerTableContainer', () => ({
  default: () => <div data-testid="customer-table-container">Customer Table Container</div>,
}));

describe('CustomerTable Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders CustomerTableContainer', () => {
    const { getByTestId } = render(<CustomerTable />);
    expect(getByTestId('customer-table-container')).toBeInTheDocument();
  });

  it('is a simple wrapper component', () => {
    const { container } = render(<CustomerTable />);
    
    // Should only contain the container component
    expect(container.firstChild).toHaveAttribute('data-testid', 'customer-table-container');
  });

  it('passes no props to container', () => {
    // Since it's a simple wrapper, it should render without any props
    expect(() => render(<CustomerTable />)).not.toThrow();
  });
});