import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';

interface NavigationState {
  isNavigating: boolean;
  previousPath: string | null;
  navigationHistory: string[];
}

export const useSmartNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [navigationState, setNavigationState] = useState<NavigationState>({
    isNavigating: false,
    previousPath: null,
    navigationHistory: [location.pathname],
  });

  // Track navigation history
  useEffect(() => {
    setNavigationState(prev => ({
      ...prev,
      previousPath: prev.navigationHistory[prev.navigationHistory.length - 1] || null,
      navigationHistory: [...prev.navigationHistory.slice(-9), location.pathname],
    }));
  }, [location.pathname]);

  // Enhanced navigation with loading states and error handling
  const smartNavigate = useCallback(async (
    to: string,
    options?: {
      replace?: boolean;
      state?: any;
      showLoading?: boolean;
      loadingMessage?: string;
      onError?: (error: Error) => void;
    }
  ) => {
    const { 
      replace = false, 
      state, 
      showLoading = true, 
      loadingMessage = 'Navigating...',
      onError 
    } = options || {};

    try {
      if (showLoading) {
        setNavigationState(prev => ({ ...prev, isNavigating: true }));
        
        // Show loading toast for longer navigations
        const loadingToast = toast({
          title: loadingMessage,
          description: "Please wait...",
        });
      }

      // Simulate async navigation (for API calls, validation, etc.)
      await new Promise(resolve => setTimeout(resolve, 100));

      navigate(to, { replace, state });

      // Success feedback
      if (showLoading) {
        toast({
          title: "Navigation successful",
          description: `Navigated to ${to}`,
        });
      }

    } catch (error) {
      const navigationError = error instanceof Error ? error : new Error('Navigation failed');
      
      if (onError) {
        onError(navigationError);
      } else {
        toast({
          title: "Navigation failed",
          description: navigationError.message,
          variant: "destructive",
        });
      }
    } finally {
      setNavigationState(prev => ({ ...prev, isNavigating: false }));
    }
  }, [navigate]);

  // Navigate back with fallback
  const goBack = useCallback((fallbackPath: string = '/dashboard') => {
    if (navigationState.previousPath && navigationState.previousPath !== location.pathname) {
      smartNavigate(navigationState.previousPath, { showLoading: false });
    } else {
      smartNavigate(fallbackPath, { showLoading: false });
    }
  }, [navigationState.previousPath, location.pathname, smartNavigate]);

  // Navigate with confirmation for unsaved changes
  const navigateWithConfirmation = useCallback(async (
    to: string,
    hasUnsavedChanges: boolean,
    options?: {
      confirmMessage?: string;
      replace?: boolean;
      state?: any;
    }
  ) => {
    const { 
      confirmMessage = 'You have unsaved changes. Are you sure you want to leave?',
      ...navOptions 
    } = options || {};

    if (hasUnsavedChanges) {
      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) return false;
    }

    await smartNavigate(to, navOptions);
    return true;
  }, [smartNavigate]);

  // Breadcrumb navigation
  const getBreadcrumbs = useCallback(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = pathSegments.map((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
      return { path, label, isActive: index === pathSegments.length - 1 };
    });

    // Add home breadcrumb
    return [
      { path: '/', label: 'Home', isActive: location.pathname === '/' },
      ...breadcrumbs
    ];
  }, [location.pathname]);

  // Quick navigation to common routes
  const quickNav = {
    dashboard: () => smartNavigate('/dashboard'),
    customers: () => smartNavigate('/customers'),
    analytics: () => smartNavigate('/analytics'),
    pipeline: () => smartNavigate('/pipeline'),
    conversations: () => smartNavigate('/conversations'),
    quotes: () => smartNavigate('/quotes'),
    employees: () => smartNavigate('/employees'),
    auth: () => smartNavigate('/auth'),
  };

  // Check if current route is active
  const isRouteActive = useCallback((route: string) => {
    return location.pathname === route || location.pathname.startsWith(route + '/');
  }, [location.pathname]);

  // Get relative navigation
  const getRelativeNavigation = useCallback(() => {
    const currentSegments = location.pathname.split('/').filter(Boolean);
    
    return {
      parent: currentSegments.length > 1 
        ? '/' + currentSegments.slice(0, -1).join('/')
        : '/',
      siblings: [], // Could be implemented based on app structure
      children: [], // Could be implemented based on app structure
    };
  }, [location.pathname]);

  // Navigation guards
  const addNavigationGuard = useCallback((
    guard: (to: string, from: string) => boolean | Promise<boolean>
  ) => {
    // This would be implemented with a navigation guard system
    // For now, we'll store it for future use
    return () => {
      // Remove guard
    };
  }, []);

  return {
    // State
    isNavigating: navigationState.isNavigating,
    currentPath: location.pathname,
    previousPath: navigationState.previousPath,
    navigationHistory: navigationState.navigationHistory,

    // Navigation methods
    navigate: smartNavigate,
    goBack,
    navigateWithConfirmation,

    // Utilities
    getBreadcrumbs,
    isRouteActive,
    getRelativeNavigation,
    addNavigationGuard,

    // Quick navigation
    quickNav,

    // Raw router methods (for advanced use)
    rawNavigate: navigate,
    location,
  };
};