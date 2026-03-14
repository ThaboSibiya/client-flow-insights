import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Workspace } from '@/context/WorkspaceContext';

const ACTIVE_WORKSPACE_KEY = 'quikle_active_workspace_id';

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Math.random().toString(36).substring(2, 8);
};

export const useWorkspaceActions = (
  userId: string | undefined,
  workspaces: Workspace[],
  setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>,
  setActiveWorkspace: React.Dispatch<React.SetStateAction<Workspace | null>>,
  queryClient: { removeQueries: (opts: any) => void },
) => {
  const { toast } = useToast();

  const switchWorkspace = useCallback(
    (workspaceId: string) => {
      const target = workspaces.find((w) => w.id === workspaceId);
      if (target) {
        setActiveWorkspace(target);
        localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspaceId);

        // Invalidate workspace-scoped queries
        queryClient.removeQueries({
          predicate: (query: any) => {
            const key = query.queryKey;
            return Array.isArray(key) && key.some(
              (k: any) => typeof k === 'string' && (
                ['customers', 'invoices', 'payments', 'tickets', 'quotes', 'employees',
                 'conversations', 'projects', 'analytics', 'debtors', 'finance'].includes(k)
              )
            );
          },
        });

        toast({
          title: 'Workspace switched',
          description: `Now viewing "${target.name}"`,
        });
      }
    },
    [workspaces, toast, queryClient, setActiveWorkspace]
  );

  const createWorkspace = useCallback(
    async (name: string, industry?: string): Promise<Workspace | null> => {
      if (!userId) return null;

      const slug = generateSlug(name);

      const { data: ws, error: wsError } = await supabase
        .from('workspaces')
        .insert({
          name,
          slug,
          industry: industry || null,
          created_by: userId,
        })
        .select()
        .single();

      if (wsError || !ws) {
        toast({
          title: 'Failed to create workspace',
          description: wsError?.message || 'Unknown error',
          variant: 'destructive',
        });
        return null;
      }

      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({ workspace_id: ws.id, user_id: userId, role: 'owner' });

      if (memberError) {
        toast({
          title: 'Workspace created but failed to assign owner',
          description: memberError.message,
          variant: 'destructive',
        });
        return null;
      }

      const newWs: Workspace = { ...ws, role: 'owner' };
      setWorkspaces((prev) => [...prev, newWs]);
      setActiveWorkspace(newWs);
      localStorage.setItem(ACTIVE_WORKSPACE_KEY, ws.id);

      toast({
        title: 'Workspace created',
        description: `"${name}" is now your active workspace.`,
      });

      return newWs;
    },
    [userId, toast, setWorkspaces, setActiveWorkspace]
  );

  return { switchWorkspace, createWorkspace };
};
