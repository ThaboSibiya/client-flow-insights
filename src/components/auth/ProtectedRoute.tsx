
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { checkUserOnboardingStatus } from '@/utils/authUtils';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  element: React.ReactElement;
  redirectTo?: string;
  requiresOnboarding?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  redirectTo = '/auth',
  requiresOnboarding = false,
}) => {
  const { user, loading: authLoading } = useAuth();
  const [onboardingCheck, setOnboardingCheck] = useState<{
    loading: boolean;
    needsOnboarding: boolean;
    redirectPath: string;
  }>({
    loading: true,
    needsOnboarding: false,
    redirectPath: '/dashboard'
  });

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        setOnboardingCheck({ loading: false, needsOnboarding: false, redirectPath: '/dashboard' });
        return;
      }

      try {
        const status = await checkUserOnboardingStatus(user.id);
        setOnboardingCheck({
          loading: false,
          needsOnboarding: status.needsOnboarding,
          redirectPath: status.redirectPath
        });
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setOnboardingCheck({
          loading: false,
          needsOnboarding: true,
          redirectPath: '/company-onboarding'
        });
      }
    };

    if (!authLoading) {
      checkOnboarding();
    }
  }, [user, authLoading]);

  if (authLoading || onboardingCheck.loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // If this route requires onboarding to be completed and user hasn't completed it
  if (!requiresOnboarding && onboardingCheck.needsOnboarding) {
    return <Navigate to="/company-onboarding" replace />;
  }

  // If this is the onboarding route but user has already completed onboarding
  if (requiresOnboarding && !onboardingCheck.needsOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

export default ProtectedRoute;
