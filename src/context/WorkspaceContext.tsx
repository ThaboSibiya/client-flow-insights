import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  industry: string | null;
  created_by: string;
  created_at: string;
  role: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  loading: boolean;
  needsOnboarding: boolean;
  setNeedsOnboarding: (v: boolean) => void;
  switchWorkspace: (workspaceId: string) => void;
  createWorkspace: (name: string, industry?: string) => Promise<Workspace | null>;
  refetchWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const ACTIVE_WORKSPACE_KEY = 'quikle_active_workspace_id';

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Math.random().toString(36).substring(2, 8);
};

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const fetchWorkspaces = useCallback(async () => {
    if (!user) {
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
            id,
            name,
            slug,
            logo_url,
            industry,
            created_by,
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const mapped: Workspace[] = (data || [])
        .filter((d: any) => d.workspace)
        .map((d: any) => ({
          ...d.workspace,
          role: d.role,
        }));

      setWorkspaces(mapped);

      // Restore last active workspace or pick first
      const savedId = localStorage.getItem(ACTIVE_WORKSPACE_KEY);
      const saved = mapped.find((w) => w.id === savedId);
      if (saved) {
        setActiveWorkspace(saved);
      } else if (mapped.length > 0) {
        setActiveWorkspace(mapped[0]);
        localStorage.setItem(ACTIVE_WORKSPACE_KEY, mapped[0].id);
      } else {
        // No workspaces — show onboarding wizard instead of auto-creating
        setNeedsOnboarding(true);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const autoCreateDefaultWorkspace = useCallback(async () => {
    if (!user) return;

    const name = user.email?.split('@')[0] || 'My Business';
    const slug = generateSlug(name);

    const { data: ws, error: wsError } = await supabase
      .from('workspaces')
      .insert({ name, slug, created_by: user.id })
      .select()
      .single();

    if (wsError || !ws) {
      console.error('Error creating default workspace:', wsError);
      return;
    }

    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({ workspace_id: ws.id, user_id: user.id, role: 'owner' });

    if (memberError) {
      console.error('Error adding owner to workspace:', memberError);
      return;
    }

    const newWs: Workspace = { ...ws, role: 'owner' };
    setWorkspaces([newWs]);
    setActiveWorkspace(newWs);
    localStorage.setItem(ACTIVE_WORKSPACE_KEY, ws.id);
  }, [user]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const queryClient = useQueryClient();

  const switchWorkspace = useCallback(
    (workspaceId: string) => {
      const target = workspaces.find((w) => w.id === workspaceId);
      if (target) {
        setActiveWorkspace(target);
        localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspaceId);

        // Invalidate all workspace-scoped queries to prevent stale data
        queryClient.removeQueries({
          predicate: (query) => {
            const key = query.queryKey;
            // Remove queries that include a workspace-related key segment
            return Array.isArray(key) && key.some(
              (k) => typeof k === 'string' && (
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
    [workspaces, toast, queryClient]
  );

  const createWorkspace = useCallback(
    async (name: string, industry?: string): Promise<Workspace | null> => {
      if (!user) return null;

      const slug = generateSlug(name);

      const { data: ws, error: wsError } = await supabase
        .from('workspaces')
        .insert({
          name,
          slug,
          industry: industry || null,
          created_by: user.id,
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
        .insert({ workspace_id: ws.id, user_id: user.id, role: 'owner' });

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
    [user, toast]
  );

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        loading,
        switchWorkspace,
        createWorkspace,
        refetchWorkspaces: fetchWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
