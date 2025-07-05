
import React from 'react';
import { useEmployeeAuth } from '@/hooks/useEmployeeAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';

interface EmployeeAccessCheckerProps {
  children: React.ReactNode;
  requiredPrivilege?: string;
  fallback?: React.ReactNode;
}

const EmployeeAccessChecker = ({ 
  children, 
  requiredPrivilege, 
  fallback 
}: EmployeeAccessCheckerProps) => {
  const { loading, isCompanyOwner, canAccessFeature } = useEmployeeAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-quikle-primary"></div>
      </div>
    );
  }

  // Company owners have full access
  if (isCompanyOwner) {
    return <>{children}</>;
  }

  // If no specific privilege is required, show content
  if (!requiredPrivilege) {
    return <>{children}</>;
  }

  // Check if user has the required privilege
  const hasAccess = canAccessFeature(requiredPrivilege);

  if (!hasAccess) {
    return fallback || (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          You don't have permission to access this feature. Please contact your administrator.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};

export default EmployeeAccessChecker;
