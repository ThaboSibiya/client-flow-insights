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

  const invalidateWorkspaceQueries = useCallback(() => {
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
  }, [queryClient]);

  const switchWorkspace = useCallback(
    (workspaceId: string) => {
      const target = workspaces.find((w) => w.id === workspaceId);
      if (!target) return;

      // Don't re-switch to the same workspace
      const currentId = localStorage.getItem(ACTIVE_WORKSPACE_KEY);
      if (currentId === workspaceId) return;

      setActiveWorkspace(target);
      localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspaceId);
      invalidateWorkspaceQueries();

      toast({
        title: 'Workspace switched',
        description: `Now viewing "${target.name}"`,
      });
    },
    [workspaces, toast, invalidateWorkspaceQueries, setActiveWorkspace]
  );

  const createWorkspace = useCallback(
    async (name: string, industry?: string): Promise<Workspace | null> => {
      if (!userId) return null;

      // Ensure auth session is ready so auth.uid() is available for RLS
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUserId = sessionData?.session?.user?.id;
      if (!sessionUserId) {
        toast({
          title: 'Authentication error',
          description: 'Please sign in again and retry.',
          variant: 'destructive',
        });
        return null;
      }

      const slug = generateSlug(name);

      const { data: ws, error: wsError } = await supabase
        .from('workspaces')
        .insert({
          name,
          slug,
          industry: industry || null,
          created_by: sessionUserId,
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
        .insert({ workspace_id: ws.id, user_id: sessionUserId, role: 'owner' });

      if (memberError) {
        // Clean up orphaned workspace
        await supabase.from('workspaces').delete().eq('id', ws.id);
        toast({
          title: 'Failed to create workspace',
          description: memberError.message,
          variant: 'destructive',
        });
        return null;
      }

      const newWs: Workspace = { ...ws, role: 'owner' };
      setWorkspaces((prev) => [...prev, newWs]);
      setActiveWorkspace(newWs);
      localStorage.setItem(ACTIVE_WORKSPACE_KEY, ws.id);
      invalidateWorkspaceQueries();

      toast({
        title: 'Workspace created',
        description: `"${name}" is now your active workspace.`,
      });

      return newWs;
    },
    [userId, toast, setWorkspaces, setActiveWorkspace, invalidateWorkspaceQueries]
  );

  return { switchWorkspace, createWorkspace };
};
