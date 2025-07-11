
import React from 'react';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import MobileEmployeeDirectory from './mobile/MobileEmployeeDirectory';
import EmployeeList from './EmployeeList';

interface Employee {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  designation: string;
  title: string;
  department?: string;
  role: string;
  status: string;
  hire_date: string;
  is_invited?: boolean;
  auth_user_id?: string;
  last_login_at?: string;
}

interface ResponsiveEmployeeManagerProps {
  employees: Employee[];
  loading: boolean;
  onEditEmployee: (employee: Employee) => void;
  onInvitationSent?: () => void;
  onAddEmployee: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  currentUserRole?: string;
}

const ResponsiveEmployeeManager = ({
  employees,
  loading,
  onEditEmployee,
  onInvitationSent,
  onAddEmployee,
  searchTerm,
  onSearchChange,
  currentUserRole = 'admin'
}: ResponsiveEmployeeManagerProps) => {
  const { shouldUseMobileView } = useMobileDetection();

  if (shouldUseMobileView) {
    return (
      <MobileEmployeeDirectory
        employees={employees}
        loading={loading}
        onEditEmployee={onEditEmployee}
        onAddEmployee={onAddEmployee}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />
    );
  }

  return (
    <EmployeeList
      employees={employees}
      loading={loading}
      onAddEmployee={onAddEmployee}
      onEditEmployee={onEditEmployee}
      onInviteEmployee={() => {}} // Placeholder since invite functionality might be handled elsewhere
      onInvitationSent={onInvitationSent}
      currentUserRole={currentUserRole}
    />
  );
};

export default ResponsiveEmployeeManager;
