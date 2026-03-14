import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { useWorkspaceFetch } from '@/hooks/useWorkspaceFetch';
import { useWorkspaceActions } from '@/hooks/useWorkspaceActions';

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

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const { fetchWorkspaces } = useWorkspaceFetch(
    user?.id,
    setWorkspaces,
    setActiveWorkspace,
    setLoading,
    setNeedsOnboarding,
  );

  const { switchWorkspace, createWorkspace } = useWorkspaceActions(
    user?.id,
    workspaces,
    setWorkspaces,
    setActiveWorkspace,
    queryClient,
  );

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        loading,
        needsOnboarding,
        setNeedsOnboarding,
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
