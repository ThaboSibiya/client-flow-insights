import { useState, useCallback, useMemo } from 'react';
import { Project, Task, ProjectFilters, TeamMember, TaskStatus, ProjectStatus, Priority, ProjectEventHandlers } from '@/types/project';
import { useProjectErrorHandling } from './useProjectErrorHandling';
import { useProjectPerformance } from './useProjectPerformance';
import { validateProject, sanitizeProjectInput, sanitizeNumericInput } from '@/utils/project-validation';

// Mock data for demonstration
const mockTeamMembers: TeamMember[] = [
  { id: '1', name: 'John Smith', email: 'john@company.com', role: 'Project Manager', department: 'Management', avatar: undefined },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'Developer', department: 'Engineering', avatar: undefined },
  { id: '3', name: 'Mike Wilson', email: 'mike@company.com', role: 'Designer', department: 'Design', avatar: undefined },
  { id: '4', name: 'Lisa Brown', email: 'lisa@company.com', role: 'QA Engineer', department: 'Engineering', avatar: undefined },
];

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
    owner: mockTeamMembers[0],
    team: mockTeamMembers,
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
    owner: mockTeamMembers[1],
    team: [mockTeamMembers[1], mockTeamMembers[3]],
    tasks: [],
    tags: ['mobile', 'react-native', 'app'],
    client: 'External Client',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-25'),
  },
];

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
  addProject: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
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
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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

  const addTask = useCallback((projectId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? {
            ...project,
            tasks: [...project.tasks, newTask],
            updatedAt: new Date()
          }
        : project
    ));
  }, []);

  const updateTask = useCallback((projectId: string, taskId: string, updates: Partial<Task>) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? {
            ...project,
            tasks: project.tasks.map(task =>
              task.id === taskId 
                ? { ...task, ...updates, updatedAt: new Date() }
                : task
            ),
            updatedAt: new Date()
          }
        : project
    ));
  }, []);

  const deleteTask = useCallback((projectId: string, taskId: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? {
            ...project,
            tasks: project.tasks.filter(task => task.id !== taskId),
            updatedAt: new Date()
          }
        : project
    ));
  }, []);

  const addProject = useCallback((projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
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
        return;
      }
      
      // Helper function to extract proper Date from complex date objects
      const extractDate = (dateValue: unknown): Date => {
        if (dateValue instanceof Date) return dateValue;
        if (dateValue && typeof dateValue === 'object' && dateValue !== null) {
          const objValue = dateValue as Record<string, unknown>;
          if (objValue.value) {
            if (typeof objValue.value === 'string' && objValue.value.includes('T')) {
              return new Date(objValue.value);
            }
            if (typeof objValue.value === 'string' || typeof objValue.value === 'number') {
              return new Date(objValue.value);
            }
          }
        }
        if (typeof dateValue === 'string' || typeof dateValue === 'number') {
          return new Date(dateValue);
        }
        return new Date(); // fallback to current date
      };
      
      // Ensure dates are proper Date objects
      const startDate = extractDate(sanitizedData.startDate);
      const dueDate = extractDate(sanitizedData.dueDate);
      
      // Validate date range
      if (startDate >= dueDate) {
        logError(new Error('Start date must be before due date'), 'addProject');
        return;
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
      
      const newProject: Project = {
        ...sanitizedData,
        id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        startDate,
        dueDate,
        team: cleanTeam,
        tasks: [],
        tags: sanitizedData.tags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setProjects(prev => [newProject, ...prev]);
      
    } catch (error) {
      logError(error, 'addProject');
    } finally {
      setIsLoading(false);
      endMeasure();
    }
  }, [logError, startMeasure]);

  const updateProject = useCallback((projectId: string, updates: Partial<Project>) => {
    const endMeasure = startMeasure('updateProject');
    
    try {
      setProjects(prev => prev.map(project => {
        if (project.id === projectId) {
          const sanitizedUpdates = {
            ...updates,
            name: updates.name ? sanitizeProjectInput(updates.name) : project.name,
            description: updates.description ? sanitizeProjectInput(updates.description) : project.description,
            budget: updates.budget !== undefined ? sanitizeNumericInput(updates.budget) : project.budget,
            updatedAt: new Date()
          };
          return { ...project, ...sanitizedUpdates };
        }
        return project;
      }));
    } catch (error) {
      logError(error, 'updateProject');
    } finally {
      endMeasure();
    }
  }, [logError, startMeasure]);

  const deleteProject = useCallback((projectId: string) => {
    const endMeasure = startMeasure('deleteProject');
    
    try {
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
    teamMembers: mockTeamMembers,
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
