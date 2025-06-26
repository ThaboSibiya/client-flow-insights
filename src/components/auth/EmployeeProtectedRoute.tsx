
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useEmployeeAuth } from '@/hooks/useEmployeeAuth';
import LoadingSpinner from './LoadingSpinner';

interface EmployeeProtectedRouteProps {
  element: React.ReactElement;
  requiredRole?: string[];
  redirectTo?: string;
}

const EmployeeProtectedRoute: React.FC<EmployeeProtectedRouteProps> = ({
  element,
  requiredRole = [],
  redirectTo = '/dashboard'
}) => {
  const { employeeProfile, isCompanyOwner, loading, getAccessLevel } = useEmployeeAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Allow company owners to access everything
  if (isCompanyOwner) {
    return element;
  }

  // Check if user has employee profile
  if (!employeeProfile) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role requirements
  if (requiredRole.length > 0) {
    const userRole = getAccessLevel();
    if (!requiredRole.includes(userRole)) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return element;
};

export default EmployeeProtectedRoute;
