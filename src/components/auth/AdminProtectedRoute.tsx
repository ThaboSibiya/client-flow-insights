
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useEmployeeProfile } from '@/hooks/useEmployeeProfile';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '@/context/AuthContext';

interface AdminProtectedRouteProps {
  element: React.ReactElement;
  redirectTo?: string;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  element,
  redirectTo = '/dashboard'
}) => {
  const { loading: authLoading, user } = useAuth();
  const { data: employee, isLoading: profileLoading } = useEmployeeProfile();

  if (authLoading || profileLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (employee?.role !== 'admin') {
    return <Navigate to={redirectTo} replace />;
  }

  return element;
};

export default AdminProtectedRoute;
