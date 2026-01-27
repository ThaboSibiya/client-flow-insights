
import React from 'react';
import { Navigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { useEmployeeAuth } from '@/hooks/useEmployeeAuth';

interface OwnerProtectedRouteProps {
  element: React.ReactElement;
  redirectTo?: string;
}

/**
 * Route protection component that only allows company owners to access
 * Used for sensitive settings like billing and subscription management
 */
const OwnerProtectedRoute: React.FC<OwnerProtectedRouteProps> = ({
  element,
  redirectTo = '/settings/general'
}) => {
  const { isCompanyOwner, loading } = useEmployeeAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isCompanyOwner) {
    return <Navigate to={redirectTo} replace />;
  }

  return element;
};

export default OwnerProtectedRoute;
