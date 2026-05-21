import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Project, ProjectFilters } from '@/types/project';
import { useAuth } from '@/context/AuthContext';
import { useActiveWorkspaceId } from '@/hooks/useActiveWorkspaceId';

// Optimized project data fetching with proper caching and pagination.
// NOTE: Currently returns mock data; the query is keyed on user+workspace
// so when the real Supabase query is wired up it will be workspace-scoped.
export const useOptimizedProjectData = (filters?: ProjectFilters, pageSize: number = 10) => {
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  const workspaceId = useActiveWorkspaceId();

  const {
    data: projectsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['projects', user?.id, workspaceId, filters, page, pageSize],
    enabled: !!user,
    queryFn: async () => {
      // Simulate optimized API call - in real app this would be Supabase
      const mockProjects: Project[] = [
        {
          id: 'proj-1',
          name: 'CRM Dashboard Redesign',
          description: 'Complete redesign of the main dashboard interface',
          status: 'in-progress',
          type: 'design',
          priority: 'high',
          startDate: new Date('2024-01-15'),
          dueDate: new Date('2024-03-15'),
          budget: 450000,
          spent: 216000,
          progress: 65,
          owner: { id: '1', name: 'John Smith', email: 'john@company.com', role: 'Project Manager', department: 'Management' },
          team: [],
          tasks: [],
          tags: ['ui-ux', 'frontend', 'dashboard'],
          client: 'Internal',
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-02-01'),
        },
        {
          id: 'proj-2',
          name: 'Mobile App Development',
          description: 'Native mobile app for iOS and Android',
          status: 'not-started',
          type: 'development',
          priority: 'medium',
          startDate: new Date('2024-02-01'),
          dueDate: new Date('2024-06-01'),
          budget: 900000,
          spent: 0,
          progress: 0,
          owner: { id: '2', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'Developer', department: 'Engineering' },
          team: [],
          tasks: [],
          tags: ['mobile', 'react-native', 'app'],
          client: 'External Client',
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-25'),
        },
      ];

      // Simulate network delay but keep it fast
      await new Promise(resolve => setTimeout(resolve, 100));
      
      return {
        projects: mockProjects,
        totalCount: mockProjects.length,
        hasMore: false
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const filteredProjects = useMemo(() => {
    if (!projectsData?.projects || !filters) return projectsData?.projects || [];
    
    return projectsData.projects.filter(project => {
      if (filters.status?.length > 0 && !filters.status.includes(project.status)) return false;
      if (filters.priority?.length > 0 && !filters.priority.includes(project.priority)) return false;
      if (filters.type?.length > 0 && !filters.type.includes(project.type)) return false;
      if (filters.search && !project.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }, [projectsData?.projects, filters]);

  return {
    projects: filteredProjects,
    isLoading,
    error,
    refetch,
    totalCount: projectsData?.totalCount || 0,
    hasMore: projectsData?.hasMore || false,
    page,
    setPage
  };
};
