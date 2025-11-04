import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export type FinanceRole = 'finance_admin' | 'finance_manager' | 'sales_view_only' | 'none';

interface FinancePermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
  canManageRoles: boolean;
  role: FinanceRole;
}

/**
 * Hook to check finance permissions for the current user
 */
export const useFinancePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<FinancePermissions>({
    canView: false,
    canEdit: false,
    canDelete: false,
    canExport: false,
    canManageRoles: false,
    role: 'none'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user) {
        setPermissions({
          canView: false,
          canEdit: false,
          canDelete: false,
          canExport: false,
          canManageRoles: false,
          role: 'none'
        });
        setLoading(false);
        return;
      }

      try {
        // Get employee record
        const { data: employee, error: empError } = await supabase
          .from('employees')
          .select('id')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (empError) throw empError;

        if (!employee) {
          setLoading(false);
          return;
        }

        // Get finance role from employee_privileges
        const { data: privileges, error: privError } = await supabase
          .from('employee_privileges')
          .select('finance_role')
          .eq('employee_id', employee.id)
          .maybeSingle();

        if (privError) throw privError;

        const role = (privileges?.finance_role as FinanceRole) || 'none';

        // Set permissions based on role
        const newPermissions: FinancePermissions = {
          role,
          canView: ['finance_admin', 'finance_manager', 'sales_view_only'].includes(role),
          canEdit: ['finance_admin', 'finance_manager'].includes(role),
          canDelete: role === 'finance_admin',
          canExport: ['finance_admin', 'finance_manager'].includes(role),
          canManageRoles: role === 'finance_admin'
        };

        setPermissions(newPermissions);
      } catch (error) {
        console.error('Error fetching finance permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user]);

  return {
    permissions,
    loading,
    hasViewAccess: permissions.canView,
    hasEditAccess: permissions.canEdit,
    hasDeleteAccess: permissions.canDelete,
    hasExportAccess: permissions.canExport,
    hasRoleManagement: permissions.canManageRoles,
    isFinanceAdmin: permissions.role === 'finance_admin',
    isFinanceManager: permissions.role === 'finance_manager',
    isSalesViewOnly: permissions.role === 'sales_view_only'
  };
};
