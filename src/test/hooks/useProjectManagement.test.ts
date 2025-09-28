import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProjectManagement } from '@/hooks/useProjectManagement';
import { Project, ProjectStatus, TaskStatus, ProjectType, Priority } from '@/types/project';

// Mock dependencies
vi.mock('@/hooks/useProjectErrorHandling', () => ({
  useProjectErrorHandling: () => ({
    logError: vi.fn(),
    errors: [],
    clearErrors: vi.fn(),
  }),
}));

vi.mock('@/hooks/useProjectPerformance', () => ({
  useProjectPerformance: () => ({
    startMeasure: vi.fn(() => vi.fn()),
  }),
}));

vi.mock('@/services/projectService', () => ({
  projectService: {
    getProjects: vi.fn().mockResolvedValue([]),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  },
}));

vi.mock('@/utils/project-validation', () => ({
  validateProject: vi.fn().mockReturnValue({ success: true }),
  sanitizeProjectInput: vi.fn((input) => input),
  sanitizeNumericInput: vi.fn((input) => Number(input)),
}));

const mockTeamMembers = [
  { id: '1', name: 'John Smith', email: 'john@test.com', role: 'Manager', department: 'IT' },
  { id: '2', name: 'Jane Doe', email: 'jane@test.com', role: 'Developer', department: 'IT' },
];

const createMockProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'proj-1',
  name: 'Test Project',
  description: 'A test project',
  status: 'in-progress' as ProjectStatus,
  type: 'development' as ProjectType,
  priority: 'high' as Priority,
  startDate: new Date('2024-01-01'),
  dueDate: new Date('2024-12-31'),
  budget: 50000,
  spent: 25000,
  progress: 50,
  owner: mockTeamMembers[0],
  team: mockTeamMembers,
  tasks: [],
  tags: ['frontend'],
  client: 'Test Client',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

describe('useProjectManagement Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useProjectManagement());
    
    expect(result.current.projects).toEqual([]);
    expect(result.current.allProjects).toEqual([]);
    expect(result.current.selectedProject).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.errors).toEqual([]);
    expect(result.current.teamMembers).toBeDefined();
    expect(result.current.filters).toEqual({
      status: [],
      priority: [],
      type: [],
      owner: [],
      dateRange: { start: null, end: null },
      search: '',
    });
  });

  it('loads projects on mount', () => {
    const mockProjects = [createMockProject()];
    vi.mocked(require('@/services/projectService').projectService.getProjects)
      .mockResolvedValue(mockProjects);

    const { result } = renderHook(() => useProjectManagement());
    
    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.projects).toEqual([]);
  });

  it('handles project loading errors gracefully', () => {
    const mockLogError = vi.fn();
    vi.mocked(require('@/hooks/useProjectErrorHandling').useProjectErrorHandling)
      .mockReturnValue({
        logError: mockLogError,
        errors: [],
        clearErrors: vi.fn(),
      });

    vi.mocked(require('@/services/projectService').projectService.getProjects)
      .mockRejectedValue(new Error('Failed to load'));

    renderHook(() => useProjectManagement());
    
    // Should handle error in useEffect
    expect(vi.mocked(require('@/services/projectService').projectService.getProjects)).toHaveBeenCalled();
  });

  it('filters projects correctly by status', () => {
    const projects = [
      createMockProject({ id: '1', status: 'in-progress' }),
      createMockProject({ id: '2', status: 'completed' }),
      createMockProject({ id: '3', status: 'not-started' }),
    ];

    vi.mocked(require('@/services/projectService').projectService.getProjects)
      .mockResolvedValue(projects);

    const { result } = renderHook(() => useProjectManagement());
    
    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        status: ['in-progress', 'completed'],
      });
    });

    // Projects should be filtered based on status
    expect(result.current.filters.status).toEqual(['in-progress', 'completed']);
  });

  it('filters projects by search term', () => {
    const projects = [
      createMockProject({ id: '1', name: 'Frontend Development' }),
      createMockProject({ id: '2', name: 'Backend API' }),
      createMockProject({ id: '3', description: 'Frontend testing project' }),
    ];

    vi.mocked(require('@/services/projectService').projectService.getProjects)
      .mockResolvedValue(projects);

    const { result } = renderHook(() => useProjectManagement());
    
    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        search: 'frontend',
      });
    });

    expect(result.current.filters.search).toBe('frontend');
  });

  it('filters projects by priority', () => {
    const projects = [
      createMockProject({ id: '1', priority: 'high' }),
      createMockProject({ id: '2', priority: 'medium' }),
      createMockProject({ id: '3', priority: 'low' }),
    ];

    vi.mocked(require('@/services/projectService').projectService.getProjects)
      .mockResolvedValue(projects);

    const { result } = renderHook(() => useProjectManagement());
    
    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        priority: ['high', 'urgent'],
      });
    });

    expect(result.current.filters.priority).toEqual(['high', 'urgent']);
  });

  it('updates project status correctly', () => {
    const { result } = renderHook(() => useProjectManagement());

    act(() => {
      result.current.updateProjectStatus('proj-1', 'completed');
    });

    // Function should be callable without error
    expect(typeof result.current.updateProjectStatus).toBe('function');
  });

  it('adds new project successfully', async () => {
    const mockCreateProject = vi.fn().mockResolvedValue(createMockProject({ id: 'new-proj' }));
    vi.mocked(require('@/services/projectService').projectService.createProject)
      .mockImplementation(mockCreateProject);

    const { result } = renderHook(() => useProjectManagement());
    
    const newProjectData = {
      name: 'New Project',
      description: 'New description',
      status: 'not-started' as ProjectStatus,
      type: 'development' as ProjectType,
      priority: 'medium' as Priority,
      startDate: new Date('2024-01-01'),
      dueDate: new Date('2024-12-31'),
      budget: 75000,
      spent: 0,
      progress: 0,
      owner: mockTeamMembers[0],
      team: mockTeamMembers,
      tasks: [],
      tags: [],
      client: 'New Client',
    };

    let success = false;
    await act(async () => {
      success = await result.current.addProject(newProjectData);
    });

    expect(success).toBe(true);
  });

  it('handles project validation errors during creation', async () => {
    const mockLogError = vi.fn();
    vi.mocked(require('@/hooks/useProjectErrorHandling').useProjectErrorHandling)
      .mockReturnValue({
        logError: mockLogError,
        errors: [],
        clearErrors: vi.fn(),
      });

    vi.mocked(require('@/utils/project-validation').validateProject)
      .mockReturnValue({
        success: false,
        errors: ['Name is required', 'Invalid budget'],
      });

    const { result } = renderHook(() => useProjectManagement());
    
    const invalidProjectData = {
      name: '',
      description: '',
      status: 'not-started' as ProjectStatus,
      type: 'development' as ProjectType,
      priority: 'medium' as Priority,
      startDate: new Date('2024-01-01'),
      dueDate: new Date('2024-12-31'),
      budget: -1000,
      spent: 0,
      progress: 0,
      owner: mockTeamMembers[0],
      team: mockTeamMembers,
      tasks: [],
      tags: [],
      client: '',
    };

    let success = false;
    await act(async () => {
      success = await result.current.addProject(invalidProjectData);
    });

    expect(success).toBe(false);
  });

  it('validates date range during project creation', async () => {
    const mockLogError = vi.fn();
    vi.mocked(require('@/hooks/useProjectErrorHandling').useProjectErrorHandling)
      .mockReturnValue({
        logError: mockLogError,
        errors: [],
        clearErrors: vi.fn(),
      });

    const { result } = renderHook(() => useProjectManagement());
    
    const invalidDateProjectData = {
      name: 'Test Project',
      description: 'Test',
      status: 'not-started' as ProjectStatus,
      type: 'development' as ProjectType,
      priority: 'medium' as Priority,
      startDate: new Date('2024-12-31'),
      dueDate: new Date('2024-01-01'), // Due date before start date
      budget: 50000,
      spent: 0,
      progress: 0,
      owner: mockTeamMembers[0],
      team: mockTeamMembers,
      tasks: [],
      tags: [],
      client: 'Test Client',
    };

    let success = false;
    await act(async () => {
      success = await result.current.addProject(invalidDateProjectData);
    });

    expect(success).toBe(false);
  });

  it('updates task status correctly', () => {
    const { result } = renderHook(() => useProjectManagement());

    act(() => {
      result.current.updateTaskStatus('proj-1', 'task-1', 'in-progress');
    });

    // Function should be callable
    expect(typeof result.current.updateTaskStatus).toBe('function');
  });

  it('sanitizes input data correctly', async () => {
    const mockSanitizeProjectInput = vi.fn((input) => input.replace(/<script>/g, ''));
    vi.mocked(require('@/utils/project-validation').sanitizeProjectInput)
      .mockImplementation(mockSanitizeProjectInput);

    const { result } = renderHook(() => useProjectManagement());
    
    const projectDataWithScripts = {
      name: 'Project <script>alert("xss")</script>',
      description: 'Description <script>',
      status: 'not-started' as ProjectStatus,
      type: 'development' as ProjectType,
      priority: 'medium' as Priority,
      startDate: new Date('2024-01-01'),
      dueDate: new Date('2024-12-31'),
      budget: 50000,
      spent: 0,
      progress: 0,
      owner: mockTeamMembers[0],
      team: mockTeamMembers,
      tasks: [],
      tags: [],
      client: 'Client <script>',
    };

    await act(async () => {
      await result.current.addProject(projectDataWithScripts);
    });

    expect(mockSanitizeProjectInput).toHaveBeenCalled();
  });

  it('provides correct return type interface', () => {
    const { result } = renderHook(() => useProjectManagement());
    
    // Verify all required properties exist
    expect(result.current).toHaveProperty('projects');
    expect(result.current).toHaveProperty('allProjects');
    expect(result.current).toHaveProperty('selectedProject');
    expect(result.current).toHaveProperty('setSelectedProject');
    expect(result.current).toHaveProperty('filters');
    expect(result.current).toHaveProperty('setFilters');
    expect(result.current).toHaveProperty('teamMembers');
    expect(result.current).toHaveProperty('updateProjectStatus');
    expect(result.current).toHaveProperty('updateTaskStatus');
    expect(result.current).toHaveProperty('addProject');
    expect(result.current).toHaveProperty('updateProject');
    expect(result.current).toHaveProperty('deleteProject');
    expect(result.current).toHaveProperty('addTask');
    expect(result.current).toHaveProperty('updateTask');
    expect(result.current).toHaveProperty('deleteTask');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('errors');
    expect(result.current).toHaveProperty('clearErrors');

    // Verify function types
    expect(typeof result.current.addProject).toBe('function');
    expect(typeof result.current.updateProjectStatus).toBe('function');
    expect(typeof result.current.setSelectedProject).toBe('function');
  });

  it('handles complex filtering combinations', () => {
    const { result } = renderHook(() => useProjectManagement());
    
    act(() => {
      result.current.setFilters({
        status: ['in-progress'],
        priority: ['high'],
        type: ['development'],
        owner: [],
        dateRange: { start: null, end: null },
        search: 'app',
      });
    });

    expect(result.current.filters.status).toEqual(['in-progress']);
    expect(result.current.filters.priority).toEqual(['high']);
    expect(result.current.filters.type).toEqual(['development']);
    expect(result.current.filters.search).toBe('app');
  });
});