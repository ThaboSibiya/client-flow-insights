import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OptimizedEmployeeList from '@/components/employees/OptimizedEmployeeList';

// Mock the useEmployeeDetails hook
vi.mock('@/hooks/useEmployeeDetails', () => ({
  useEmployeeDetails: vi.fn(() => ({
    detailedEmployees: {},
    loadingDetails: {},
    loadEmployeeDetails: vi.fn(),
  }))
}));

interface BasicEmployee {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  designation: string;
  role: string;
  status: string;
  is_invited: boolean;
  auth_user_id: string | null;
}

describe('OptimizedEmployeeList', () => {
  const mockEmployees: BasicEmployee[] = [
    {
      id: '1',
      employee_number: 'EMP001',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      designation: 'Software Engineer',
      role: 'employee',
      status: 'active',
      is_invited: true,
      auth_user_id: 'auth123',
    }
  ];

  const mockProps = {
    employees: mockEmployees,
    loading: false,
    onEditEmployee: vi.fn(),
    onInvitationSent: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    const { getByText } = render(<OptimizedEmployeeList {...mockProps} loading={true} />);
    expect(getByText('Loading employees...')).toBeInTheDocument();
  });

  it('renders employee list correctly', () => {
    const { getByText } = render(<OptimizedEmployeeList {...mockProps} />);
    expect(getByText('John Doe')).toBeInTheDocument();
    expect(getByText('john.doe@example.com')).toBeInTheDocument();
  });
});