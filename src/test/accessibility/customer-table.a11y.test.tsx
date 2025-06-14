
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '../test-utils';
import { axe, toHaveNoViolations } from 'jest-axe';
import CustomerTable from '@/components/customers/CustomerTable';

// Extend expect with jest-axe matchers
expect.extend({ toHaveNoViolations });

// Mock the CRM context for accessibility testing
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
  addCustomer: () => {},
  updateCustomerStatus: () => {},
  updateCustomer: () => {},
  deleteCustomer: () => {},
  createTicket: () => {},
  updateTicketStatus: () => {},
  addTimeEntry: () => {},
};

vi.mock('@/context/CRMContext', () => ({
  useCRM: () => mockUseCRM,
}));

describe('Customer Table Accessibility', () => {
  it('should not have accessibility violations', async () => {
    const { container } = render(<CustomerTable />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA labels for interactive elements', () => {
    const { container } = render(<CustomerTable />);
    
    // Check for proper table structure
    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
    
    // Check for proper heading structure
    const headings = container.querySelectorAll('th');
    expect(headings.length).toBeGreaterThan(0);
    
    // Check for proper button labeling
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      const hasLabel = button.getAttribute('aria-label') || 
                      button.textContent || 
                      button.querySelector('svg[aria-label]');
      expect(hasLabel).toBeTruthy();
    });
  });

  it('should be keyboard navigable', () => {
    const { container } = render(<CustomerTable />);
    
    // Check that interactive elements are focusable
    const focusableElements = container.querySelectorAll(
      'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach(element => {
      expect(element).not.toHaveAttribute('tabindex', '-1');
    });
  });
});
