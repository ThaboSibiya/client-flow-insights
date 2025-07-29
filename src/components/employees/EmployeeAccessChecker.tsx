
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useEmployeeAuth } from '@/hooks/useEmployeeAuth';
import { useSecurePrivileges } from '@/hooks/useSecurePrivileges';
import LoadingSpinner from '@/components/auth/LoadingSpinner';

interface EmployeeAccessCheckerProps {
  children: React.ReactNode;
  requiredPrivilege?: keyof import('@/types/enhancedSecurity').EnhancedEmployeePrivileges;
  redirectTo?: string;
}

const EmployeeAccessChecker: React.FC<EmployeeAccessCheckerProps> = ({
  children,
  requiredPrivilege,
  redirectTo = '/dashboard'
}) => {
  const { isCompanyOwner, employeeProfile, loading: authLoading } = useEmployeeAuth();
  const { hasPrivilege, loading: privilegesLoading } = useSecurePrivileges();

  // Show loading only while authentication is being determined
  if (authLoading) {
    return <LoadingSpinner />;
  }

  // Company owners have full access to employee management
  if (isCompanyOwner) {
    return <>{children}</>;
  }

  // If user is not a company owner and has no employee profile, redirect
  if (!employeeProfile) {
    return <Navigate to={redirectTo} replace />;
  }

  // For employees, check specific privileges only if required
  if (requiredPrivilege) {
    // Show loading while checking privileges for employees
    if (privilegesLoading) {
      return <LoadingSpinner />;
    }

    // Check if employee has the required privilege
    if (!hasPrivilege(requiredPrivilege)) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <>{children}</>;
};

export default EmployeeAccessChecker;
