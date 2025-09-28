import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import EmployeeAccessChecker from '@/components/employees/EmployeeAccessChecker';

// Mock the custom hooks
const mockUseEmployeeAuth = vi.fn();
const mockUseSecurePrivileges = vi.fn();

vi.mock('@/hooks/useEmployeeAuth', () => ({
  useEmployeeAuth: () => mockUseEmployeeAuth(),
}));

vi.mock('@/hooks/useSecurePrivileges', () => ({
  useSecurePrivileges: () => mockUseSecurePrivileges(),
}));

vi.mock('@/components/auth/LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

const TestComponent = () => <div data-testid="test-content">Test Content</div>;

describe('EmployeeAccessChecker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner when auth is loading', () => {
    mockUseEmployeeAuth.mockReturnValue({
      isCompanyOwner: false,
      employeeProfile: null,
      loading: true,
    });
    mockUseSecurePrivileges.mockReturnValue({
      hasPrivilege: vi.fn(),
      loading: false,
    });

    const { getByTestId, queryByTestId } = render(
      <BrowserRouter>
        <EmployeeAccessChecker>
          <TestComponent />
        </EmployeeAccessChecker>
      </BrowserRouter>
    );

    expect(getByTestId('loading-spinner')).toBeInTheDocument();
    expect(queryByTestId('test-content')).not.toBeInTheDocument();
  });

  it('renders children for company owners', () => {
    mockUseEmployeeAuth.mockReturnValue({
      isCompanyOwner: true,
      employeeProfile: null,
      loading: false,
    });
    mockUseSecurePrivileges.mockReturnValue({
      hasPrivilege: vi.fn(),
      loading: false,
    });

    const { getByTestId } = render(
      <BrowserRouter>
        <EmployeeAccessChecker>
          <TestComponent />
        </EmployeeAccessChecker>
      </BrowserRouter>
    );

    expect(getByTestId('test-content')).toBeInTheDocument();
  });
});