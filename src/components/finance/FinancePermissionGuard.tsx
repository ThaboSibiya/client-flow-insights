import { ReactNode } from 'react';
import { useFinancePermissions } from '@/hooks/useFinancePermissions';
import { Shield, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FinancePermissionGuardProps {
  children: ReactNode;
  requireEdit?: boolean;
  requireDelete?: boolean;
  requireExport?: boolean;
  requireRoleManagement?: boolean;
  fallback?: ReactNode;
}

/**
 * Component that guards finance features based on user permissions
 * Displays children only if user has required permissions
 */
const FinancePermissionGuard = ({
  children,
  requireEdit = false,
  requireDelete = false,
  requireExport = false,
  requireRoleManagement = false,
  fallback
}: FinancePermissionGuardProps) => {
  const { permissions, loading } = useFinancePermissions();

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading permissions...</p>
        </CardContent>
      </Card>
    );
  }

  // Check if user meets requirements
  const hasRequiredPermissions = 
    permissions.canView &&
    (!requireEdit || permissions.canEdit) &&
    (!requireDelete || permissions.canDelete) &&
    (!requireExport || permissions.canExport) &&
    (!requireRoleManagement || permissions.canManageRoles);

  if (!hasRequiredPermissions) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              You don't have permission to access this feature. 
              {requireDelete && ' Only finance administrators can perform this action.'}
              {requireEdit && !requireDelete && ' This feature requires finance management access.'}
              {requireExport && ' You need export permissions to access this feature.'}
              {requireRoleManagement && ' Only finance administrators can manage roles.'}
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Contact your system administrator if you believe you should have access.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

/**
 * Simple wrapper for view-only permissions
 */
export const RequireFinanceView = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <FinancePermissionGuard fallback={fallback}>
    {children}
  </FinancePermissionGuard>
);

/**
 * Wrapper for edit permissions
 */
export const RequireFinanceEdit = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <FinancePermissionGuard requireEdit fallback={fallback}>
    {children}
  </FinancePermissionGuard>
);

/**
 * Wrapper for delete permissions (admin only)
 */
export const RequireFinanceDelete = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <FinancePermissionGuard requireDelete fallback={fallback}>
    {children}
  </FinancePermissionGuard>
);

/**
 * Wrapper for export permissions
 */
export const RequireFinanceExport = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <FinancePermissionGuard requireExport fallback={fallback}>
    {children}
  </FinancePermissionGuard>
);

/**
 * Wrapper for role management (admin only)
 */
export const RequireFinanceAdmin = ({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) => (
  <FinancePermissionGuard requireRoleManagement fallback={fallback}>
    {children}
  </FinancePermissionGuard>
);

/**
 * Show role badge based on current permissions
 */
export const FinanceRoleBadge = () => {
  const { permissions, loading } = useFinancePermissions();

  if (loading || permissions.role === 'none') {
    return null;
  }

  const roleColors = {
    finance_admin: 'bg-purple-100 text-purple-800',
    finance_manager: 'bg-blue-100 text-blue-800',
    sales_view_only: 'bg-green-100 text-green-800',
    none: 'bg-gray-100 text-gray-800'
  };

  const roleLabels = {
    finance_admin: 'Finance Admin',
    finance_manager: 'Finance Manager',
    sales_view_only: 'Sales View',
    none: 'No Access'
  };

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${roleColors[permissions.role]}`}>
      <Shield className="h-3 w-3" />
      {roleLabels[permissions.role]}
    </div>
  );
};

export default FinancePermissionGuard;
