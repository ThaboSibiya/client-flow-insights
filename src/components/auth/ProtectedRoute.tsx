
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { CRMProvider } from '@/context/CRMContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  element: React.ReactElement;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  redirectTo = '/auth',
}) => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <CRMProvider>
      {element}
    </CRMProvider>
  );
};

export default ProtectedRoute;
