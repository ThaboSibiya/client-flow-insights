import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Workspace } from '@/context/WorkspaceContext';

const ACTIVE_WORKSPACE_KEY = 'quikle_active_workspace_id';

export const useWorkspaceFetch = (
  userId: string | undefined,
  setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>,
  setActiveWorkspace: React.Dispatch<React.SetStateAction<Workspace | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setNeedsOnboarding: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const fetchWorkspaces = useCallback(async () => {
    if (!userId) {
      setWorkspaces([]);
      setActiveWorkspace(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          role,
          workspace:workspaces (
            id, name, slug, logo_url, industry, created_by, created_at
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      const mapped: Workspace[] = (data || [])
        .filter((d: any) => d.workspace)
        .map((d: any) => ({
          ...d.workspace,
          role: d.role,
        }));

      setWorkspaces(mapped);

      const savedId = localStorage.getItem(ACTIVE_WORKSPACE_KEY);
      const saved = mapped.find((w) => w.id === savedId);
      if (saved) {
        setActiveWorkspace(saved);
      } else if (mapped.length > 0) {
        setActiveWorkspace(mapped[0]);
        localStorage.setItem(ACTIVE_WORKSPACE_KEY, mapped[0].id);
      } else {
        setNeedsOnboarding(true);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, setWorkspaces, setActiveWorkspace, setLoading, setNeedsOnboarding]);

  return { fetchWorkspaces };
};
