import { useMemo } from 'react';
import { useEmployeeAuth } from './useEmployeeAuth';
import { useEnhancedPrivileges } from './useEnhancedPrivileges';

/**
 * Resolves whether the current user can use the Quikle AI agent and/or
 * create workflows through it. Owners and admins always have full access.
 *
 * Default for employees (set in DB): both true. Owners can flip them off
 * per-employee from the Employee Privileges editor.
 */
export const useAIAgentAccess = () => {
  const { isCompanyOwner, employeeProfile, loading: authLoading } = useEmployeeAuth();
  const { privileges, loading: privLoading } = useEnhancedPrivileges();

  return useMemo(() => {
    const loading = authLoading || (!!employeeProfile && privLoading);
    const role = employeeProfile?.role?.toLowerCase();
    const isAdmin = role === 'admin';

    // Owners: full access. Admins: chat + create (no delete distinction here).
    if (isCompanyOwner || isAdmin) {
      return {
        loading,
        canUseAgent: true,
        canCreateWorkflows: true,
        reason: null as string | null,
      };
    }

    // Standalone authenticated user without employee profile (edge case): allow.
    if (!employeeProfile) {
      return {
        loading,
        canUseAgent: true,
        canCreateWorkflows: true,
        reason: null,
      };
    }

    const canUseAgent = privileges.can_use_ai_agent !== false;
    const canCreateWorkflows = canUseAgent && privileges.can_create_ai_workflows !== false;

    return {
      loading,
      canUseAgent,
      canCreateWorkflows,
      reason: !canUseAgent
        ? 'Ask your administrator for AI Agent access.'
        : !canCreateWorkflows
          ? 'You can chat, but creating AI workflows is disabled for your account.'
          : null,
    };
  }, [isCompanyOwner, employeeProfile, privileges, authLoading, privLoading]);
};
