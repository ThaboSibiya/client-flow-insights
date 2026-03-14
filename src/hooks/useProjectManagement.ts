import { useState, useCallback, useMemo, useEffect } from 'react';
import { Project, Task, ProjectFilters, TeamMember, TaskStatus, ProjectStatus, Priority, ProjectEventHandlers } from '@/types/project';
import { useProjectErrorHandling } from './useProjectErrorHandling';
import { useProjectPerformance } from './useProjectPerformance';
import { validateProject, sanitizeProjectInput, sanitizeNumericInput } from '@/utils/project-validation';
import { projectService } from '@/services/projectService';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useActiveWorkspaceId } from '@/hooks/useActiveWorkspaceId';

export interface UseProjectManagementReturn extends ProjectEventHandlers {
  projects: Project[];
  allProjects: Project[];
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  filters: ProjectFilters;
  setFilters: (filters: ProjectFilters) => void;
  teamMembers: TeamMember[];
  updateProjectStatus: (projectId: string, status: ProjectStatus) => void;
  updateTaskStatus: (projectId: string, taskId: string, status: TaskStatus) => void;
  addProject: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  addTask: (projectId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (projectId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  isLoading: boolean;
  errors: string[];
  clearErrors: () => void;
}

export const useProjectManagement = (): UseProjectManagementReturn => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<ProjectFilters>({
    status: [],
    priority: [],
    type: [],
    owner: [],
    dateRange: { start: null, end: null },
    search: '',
  });

  const { logError, errors, clearErrors } = useProjectErrorHandling();
  const { startMeasure } = useProjectPerformance();

  // Load team members and projects in parallel on mount
  useEffect(() => {
    const loadTeamMembers = async (): Promise<TeamMember[]> => {
      const members: TeamMember[] = [];
      
      const [profileResult, employeesResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, first_name, last_name, email, avatar_url, role')
          .eq('id', user!.id)
          .single(),
        supabase
          .from('employees')
          .select('id, first_name, last_name, email, title, department')
          .eq('company_owner_id', user!.id)
          .eq('status', 'active'),
      ]);
      
      if (profileResult.data) {
        const profile = profileResult.data;
        const userName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email || 'Current User';
        members.push({
          id: profile.id,
          name: userName,
          email: profile.email || user!.email || '',
          role: profile.role || 'Owner',
          department: 'Management',
          avatar: profile.avatar_url || undefined,
        });
      }
      
      if (employeesResult.data) {
        employeesResult.data.forEach(emp => {
          members.push({
            id: emp.id,
            name: `${emp.first_name} ${emp.last_name}`,
            email: emp.email,
            role: emp.title || 'Employee',
            department: emp.department || 'General',
            avatar: undefined,
          });
        });
      }
      
      return members;
    };

    const loadData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Run team + projects in parallel instead of sequentially
        const [teamResult, projectsResult] = await Promise.allSettled([
          loadTeamMembers(),
          projectService.getProjects(),
        ]);

        if (teamResult.status === 'fulfilled') {
          setTeamMembers(teamResult.value);
        } else {
          console.error('Failed to load team members:', teamResult.reason);
          setTeamMembers([{
            id: user.id,
            name: user.email || 'Current User',
            email: user.email || '',
            role: 'Owner',
            department: 'Management',
            avatar: undefined,
          }]);
        }

        if (projectsResult.status === 'fulfilled') {
          setProjects(projectsResult.value);
        } else {
          console.error('Failed to load projects:', projectsResult.reason);
          logError(projectsResult.reason, 'loadProjects');
          setProjects([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, logError]);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(project.status)) {
        return false;
      }
      
      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(project.priority)) {
        return false;
      }
      
      // Type filter
      if (filters.type.length > 0 && !filters.type.includes(project.type)) {
        return false;
      }
      
      // Owner filter
      if (filters.owner.length > 0 && !filters.owner.includes(project.owner.id)) {
        return false;
      }
      
      // Search filter
      if (filters.search && !project.name.toLowerCase().includes(filters.search.toLowerCase()) && 
          !project.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Date range filter
      if (filters.dateRange.start && project.startDate < filters.dateRange.start) {
        return false;
      }
      
      if (filters.dateRange.end && project.dueDate > filters.dateRange.end) {
        return false;
      }
      
      return true;
    });
  }, [projects, filters]);

  const updateProjectStatus = useCallback((projectId: string, status: ProjectStatus) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, status, updatedAt: new Date() }
        : project
    ));
  }, []);

  const updateTaskStatus = useCallback((projectId: string, taskId: string, status: TaskStatus) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? {
            ...project,
            tasks: project.tasks.map(task =>
              task.id === taskId 
                ? { ...task, status, updatedAt: new Date() }
                : task
            ),
            updatedAt: new Date()
          }
        : project
    ));
  }, []);

  const addTask = useCallback(async (projectId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTask = await projectService.createTask(projectId, taskData);
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? {
              ...project,
              tasks: [...project.tasks, newTask],
              updatedAt: new Date()
            }
          : project
      ));
    } catch (error) {
      logError(error, 'addTask');
    }
  }, [logError]);

  const updateTask = useCallback(async (projectId: string, taskId: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await projectService.updateTask(taskId, updates);
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? {
              ...project,
              tasks: project.tasks.map(task =>
                task.id === taskId ? updatedTask : task
              ),
              updatedAt: new Date()
            }
          : project
      ));
    } catch (error) {
      logError(error, 'updateTask');
    }
  }, [logError]);

  const deleteTask = useCallback(async (projectId: string, taskId: string) => {
    try {
      await projectService.deleteTask(taskId);
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? {
              ...project,
              tasks: project.tasks.filter(task => task.id !== taskId),
              updatedAt: new Date()
            }
          : project
      ));
    } catch (error) {
      logError(error, 'deleteTask');
    }
  }, [logError]);

  const addProject = useCallback(async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    const endMeasure = startMeasure('addProject');
    
    try {
      setIsLoading(true);
      
      // Sanitize input data
      const sanitizedData = {
        ...projectData,
        name: sanitizeProjectInput(projectData.name),
        description: sanitizeProjectInput(projectData.description || ''),
        budget: sanitizeNumericInput(projectData.budget),
        client: projectData.client ? sanitizeProjectInput(projectData.client) : undefined
      };
      
      // Validate the project data
      const validation = validateProject(sanitizedData);
      if (!validation.success) {
        const errorMessage = validation.errors?.join(', ') || 'Invalid project data';
        logError(new Error(errorMessage), 'addProject');
        return false;
      }
      
      // Ensure dates are proper Date objects
      const startDate = new Date(sanitizedData.startDate);
      const dueDate = new Date(sanitizedData.dueDate);
      
      // Validate date range
      if (startDate >= dueDate) {
        logError(new Error('Start date must be before due date'), 'addProject');
        return false;
      }
      
      // Ensure team array doesn't have circular references
      const cleanTeam = Array.isArray(sanitizedData.team) ? sanitizedData.team.map(member => ({
        id: member.id,
        name: sanitizeProjectInput(member.name),
        email: sanitizeProjectInput(member.email),
        role: sanitizeProjectInput(member.role),
        department: sanitizeProjectInput(member.department),
        avatar: member.avatar
      })) : [sanitizedData.owner];
      
      const projectToCreate = {
        ...sanitizedData,
        startDate,
        dueDate,
        team: cleanTeam,
        tasks: [],
        tags: sanitizedData.tags || [],
      };
      
      // Save to database
      const newProject = await projectService.createProject(projectToCreate);
      setProjects(prev => [newProject, ...prev]);
      console.log('Project created successfully:', newProject.id);
      return true;
      
    } catch (error) {
      logError(error, 'addProject');
      return false;
    } finally {
      setIsLoading(false);
      endMeasure();
    }
  }, [logError, startMeasure]);

  const updateProject = useCallback(async (projectId: string, updates: Partial<Project>) => {
    const endMeasure = startMeasure('updateProject');
    
    try {
      const sanitizedUpdates = {
        ...updates,
        name: updates.name ? sanitizeProjectInput(updates.name) : undefined,
        description: updates.description ? sanitizeProjectInput(updates.description) : undefined,
        budget: updates.budget !== undefined ? sanitizeNumericInput(updates.budget) : undefined,
      };

      // Remove undefined values
      Object.keys(sanitizedUpdates).forEach(key => {
        if (sanitizedUpdates[key as keyof typeof sanitizedUpdates] === undefined) {
          delete sanitizedUpdates[key as keyof typeof sanitizedUpdates];
        }
      });

      const updatedProject = await projectService.updateProject(projectId, sanitizedUpdates);
      setProjects(prev => prev.map(project => 
        project.id === projectId ? updatedProject : project
      ));
    } catch (error) {
      logError(error, 'updateProject');
    } finally {
      endMeasure();
    }
  }, [logError, startMeasure]);

  const deleteProject = useCallback(async (projectId: string) => {
    const endMeasure = startMeasure('deleteProject');
    
    try {
      await projectService.deleteProject(projectId);
      setProjects(prev => prev.filter(project => project.id !== projectId));
      if (selectedProject?.id === projectId) {
        setSelectedProject(null);
      }
    } catch (error) {
      logError(error, 'deleteProject');
    } finally {
      endMeasure();
    }
  }, [selectedProject, logError, startMeasure]);

  return {
    projects: filteredProjects,
    allProjects: projects,
    selectedProject,
    setSelectedProject,
    filters,
    setFilters,
    teamMembers,
    updateProjectStatus,
    updateTaskStatus,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask,
    isLoading,
    errors: errors.map(e => e.message),
    clearErrors,
  };
};
