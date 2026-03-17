import React, { Suspense, lazy } from 'react';
import { SkeletonCard, SkeletonForm, SkeletonTable } from '@/components/common/SkeletonScreens';

// Lazy load heavy customer components
export const LazyCustomerDetailsDialog = lazy(() => 
  import('./forms/CustomerDetailsDialog')
);

export const LazyCustomerAnalytics = lazy(() => 
  import('../analytics/CustomerReportGraph').then(module => ({
    default: module.default
  }))
);

export const LazyCustomerFileUpload = lazy(() => 
  import('./CustomerFileUpload').then(module => ({
    default: module.default
  }))
);

export const LazyEquipmentDisplay = lazy(() => 
  import('./equipment/EquipmentManager')
);

export const LazyCustomDataDisplay = lazy(() => 
  import('./CustomDataDisplay')
);

// Wrapper components with proper loading states
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const CustomerDetailsWrapper: React.FC<{ 
  isOpen: boolean; 
  children: React.ReactNode;
}> = ({ isOpen, children }) => {
  if (!isOpen) return null;

  return (
    <Suspense fallback={<SkeletonForm />}>
      {children}
    </Suspense>
  );
};

export const CustomerAnalyticsWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback = <SkeletonCard />
}) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);

export const CustomerFileUploadWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback = <SkeletonForm />
}) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);

export const CustomerEquipmentWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback = <SkeletonTable rows={3} columns={4} />
}) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);

export const CustomerDataWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback = <SkeletonCard />
}) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);