
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { useEmployeeProfile } from '@/hooks/useEmployeeProfile';

interface ProtectedRouteProps {
  element: React.ReactElement;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  redirectTo = '/auth',
}) => {
  const { user, loading: authLoading } = useAuth();
  const { data: employee, isLoading: profileLoading, isSuccess } = useEmployeeProfile();
  const location = useLocation();

  const loading = authLoading || (user && profileLoading);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // If user is logged in, profile has been fetched, but no employee record exists,
  // redirect to onboarding, unless they are already trying to go there.
  if (isSuccess && !employee && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return element;
};

export default ProtectedRoute;
