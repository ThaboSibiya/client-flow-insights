import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useActiveWorkspaceId } from '@/hooks/useActiveWorkspaceId';
import { useWorkspaceSubscription } from '@/hooks/useWorkspaceSubscription';

interface PlanLimits {
  max_users: number;
  max_customers: number;
  max_storage_gb: number;
  max_webhooks: number;
}

const DEFAULT_FREE_LIMITS: PlanLimits = {
  max_users: 1,
  max_customers: 50,
  max_storage_gb: 0.5,
  max_webhooks: 1,
};

const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: DEFAULT_FREE_LIMITS,
  Solo: { max_users: 1, max_customers: 500, max_storage_gb: 2, max_webhooks: 3 },
  Team: { max_users: 10, max_customers: 2000, max_storage_gb: 10, max_webhooks: 10 },
  Enterprise: { max_users: 999999, max_customers: 999999, max_storage_gb: 50, max_webhooks: 999999 },
};

export const usePlanLimits = () => {
  const workspaceId = useActiveWorkspaceId();
  const { currentPlan, isActive } = useWorkspaceSubscription();

  const limits = isActive ? (PLAN_LIMITS[currentPlan] || DEFAULT_FREE_LIMITS) : DEFAULT_FREE_LIMITS;

  // Fetch current usage counts
  const { data: usage } = useQuery({
    queryKey: ['workspace-usage', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return { customers: 0, members: 0 };

      const [custResult, memberResult] = await Promise.all([
        supabase
          .from('customers')
          .select('id', { count: 'exact', head: true })
          .eq('workspace_id', workspaceId),
        supabase
          .from('workspace_members' as any)
          .select('id', { count: 'exact', head: true })
          .eq('workspace_id', workspaceId),
      ]);

      return {
        customers: custResult.count || 0,
        members: memberResult.count || 0,
      };
    },
    enabled: !!workspaceId,
  });

  const canAddCustomer = (usage?.customers || 0) < limits.max_customers;
  const canAddMember = (usage?.members || 0) < limits.max_users;

  return {
    limits,
    usage: usage || { customers: 0, members: 0 },
    canAddCustomer,
    canAddMember,
    currentPlan,
    isActive,
  };
};
