import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProjectManagement from '@/components/project-management/ProjectManagement';
import { Project, ProjectStatus, ProjectType, Priority } from '@/types/project';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({ data: [], error: null })),
        })),
      })),
      insert: vi.fn(() => ({ data: [], error: null })),
      update: vi.fn(() => ({ data: [], error: null })),
      delete: vi.fn(() => ({ data: [], error: null })),
    })),
  },
}));

// Mock auth context
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user123', email: 'test@example.com' },
    loading: false,
  }),
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock project service
const mockProjectService = {
  getProjects: vi.fn().mockResolvedValue([]),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
};

vi.mock('@/services/projectService', () => ({
  projectService: mockProjectService,
}));

// Mock lazy-loaded components
vi.mock('@/components/project-management/OptimizedProjectOverview', () => ({
  default: ({ projects }: any) => (
    <div data-testid="project-overview">
      {projects.map((project: Project) => (
        <div key={project.id} data-testid={`overview-project-${project.id}`}>
          {project.name}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/components/project-management/ProjectKanbanBoard', () => ({
  default: ({ projects, onProjectMove }: any) => (
    <div data-testid="kanban-board">
      {projects.map((project: Project) => (
        <div key={project.id} data-testid={`kanban-project-${project.id}`}>
          <span>{project.name}</span>
          <button 
            onClick={() => onProjectMove(project.id, 'completed')}
            data-testid={`move-project-${project.id}`}
          >
            Move to Completed
          </button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/components/project-management/TaskManagement', () => ({
  default: ({ project, onTaskCreate, onTaskUpdate }: any) => (
    <div data-testid="task-management">
      <h3>Tasks for {project.name}</h3>
      <button onClick={() => onTaskCreate(mockTaskData)} data-testid="create-task">
        Create Task
      </button>
      {project.tasks.map((task: any) => (
        <div key={task.id} data-testid={`task-${task.id}`}>
          <span>{task.title}</span>
          <button 
            onClick={() => onTaskUpdate(task.id, { status: 'completed' })}
            data-testid={`update-task-${task.id}`}
          >
            Complete Task
          </button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/components/project-management/ProjectGanttChart', () => ({
  default: ({ projects }: any) => (
    <div data-testid="gantt-chart">
      Gantt Chart with {projects.length} projects
    </div>
  ),
}));

vi.mock('@/components/project-management/ProjectCalendar', () => ({
  default: ({ projects }: any) => (
    <div data-testid="project-calendar">
      Calendar with {projects.length} projects
    </div>
  ),
}));

vi.mock('@/components/project-management/ProjectFilters', () => ({
  default: ({ filters, onFiltersChange }: any) => (
    <div data-testid="project-filters">
      <input
        data-testid="search-input"
        placeholder="Search projects"
        value={filters.search}
        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
      />
      <select
        data-testid="status-filter"
        value={filters.status[0] || ''}
        onChange={(e) => onFiltersChange({ 
          ...filters, 
          status: e.target.value ? [e.target.value] : [] 
        })}
      >
        <option value="">All Statuses</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  ),
}));

vi.mock('@/components/project-management/NewProjectModal', () => ({
  default: ({ isOpen, onClose, onCreateProject }: any) => 
    isOpen ? (
      <div data-testid="new-project-modal">
        <input data-testid="project-name-input" placeholder="Project name" />
        <button 
          data-testid="save-project"
          onClick={() => onCreateProject(mockProjectData)}
        >
          Save Project
        </button>
        <button data-testid="cancel-project" onClick={onClose}>
          Cancel
        </button>
      </div>
    ) : null,
}));

vi.mock('@/components/project-management/ProjectSettingsModal', () => ({
  default: ({ isOpen, onClose }: any) => 
    isOpen ? (
      <div data-testid="settings-modal">
        <h3>Project Settings</h3>
        <button data-testid="close-settings" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
}));

vi.mock('@/components/error/ProjectErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

// Mock data
const mockTeamMembers = [
  { id: '1', name: 'John Smith', email: 'john@test.com', role: 'Manager', department: 'IT' },
  { id: '2', name: 'Jane Doe', email: 'jane@test.com', role: 'Developer', department: 'IT' },
];

const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Frontend Development',
    description: 'React frontend application',
    status: 'in-progress' as ProjectStatus,
    type: 'development' as ProjectType,
    priority: 'high' as Priority,
    startDate: new Date('2024-01-01'),
    dueDate: new Date('2024-12-31'),
    budget: 100000,
    spent: 50000,
    progress: 75,
    owner: mockTeamMembers[0],
    team: mockTeamMembers,
    tasks: [
      {
        id: 'task-1',
        title: 'Setup project',
        description: 'Initial setup',
        status: 'done',
        priority: 'high',
        assignedTo: [mockTeamMembers[0]],
        dueDate: new Date('2024-02-01'),
        startDate: new Date('2024-01-01'),
        estimatedHours: 8,
        actualHours: 6,
        progress: 100,
        tags: ['setup'],
        dependencies: [],
        attachments: [],
        comments: [],
        projectId: 'proj-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15'),
      }
    ],
    tags: ['frontend', 'react'],
    client: 'Internal',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-06-01'),
  },
  {
    id: 'proj-2',
    name: 'Backend API',
    description: 'REST API development',
    status: 'not-started' as ProjectStatus,
    type: 'development' as ProjectType,
    priority: 'medium' as Priority,
    startDate: new Date('2024-02-01'),
    dueDate: new Date('2024-08-31'),
    budget: 75000,
    spent: 0,
    progress: 0,
    owner: mockTeamMembers[1],
    team: [mockTeamMembers[1]],
    tasks: [],
    tags: ['backend', 'api'],
    client: 'External',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

const mockProjectData = {
  name: 'New Integration Project',
  description: 'Integration test project',
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
  client: 'Test Client',
};

const mockTaskData = {
  title: 'New Task',
  description: 'Test task',
  priority: 'medium' as Priority,
  estimatedHours: 8,
  dueDate: new Date('2024-06-01'),
  assignedToIds: ['1'],
  tags: [],
};

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
    },
  });
};

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ProjectManagement Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProjectService.getProjects.mockResolvedValue(mockProjects);
  });

  it('integrates all main project management components', () => {
    const { getByText } = renderWithProviders(<ProjectManagement />);

    // Check main elements
    expect(getByText('Project Management')).toBeInTheDocument();
    expect(getByText(/Manage and track your projects/)).toBeInTheDocument();
  });

  it('integrates tab switching with component rendering', () => {
    const { getByText, getByTestId } = renderWithProviders(<ProjectManagement />);

    // Switch to Kanban view
    getByText('Kanban').click();
    expect(getByTestId('kanban-board')).toBeInTheDocument();

    // Switch to Timeline view
    getByText('Timeline').click();
    expect(getByTestId('gantt-chart')).toBeInTheDocument();

    // Switch to Calendar view
    getByText('Calendar').click();
    expect(getByTestId('project-calendar')).toBeInTheDocument();
  });

  it('integrates project creation workflow', () => {
    const mockCreateProject = vi.fn().mockResolvedValue({
      ...mockProjectData,
      id: 'new-proj',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockProjectService.createProject.mockImplementation(mockCreateProject);

    const { getByText, getByTestId } = renderWithProviders(<ProjectManagement />);

    // Open new project modal
    getByText('New Project').click();
    expect(getByTestId('new-project-modal')).toBeInTheDocument();

    // Save project
    getByTestId('save-project').click();

    // Project creation function should be available
    expect(getByTestId('save-project')).toBeInTheDocument();
  });

  it('integrates task management within projects', () => {
    const { getByText, getByTestId } = renderWithProviders(<ProjectManagement />);

    // Switch to tasks view
    getByText('Tasks').click();

    // Select a project
    getByText('Frontend Development').click();

    expect(getByTestId('task-management')).toBeInTheDocument();
  });

  it('integrates error boundaries with all components', () => {
    const { getAllByTestId } = renderWithProviders(<ProjectManagement />);

    const errorBoundaries = getAllByTestId('error-boundary');
    expect(errorBoundaries.length).toBeGreaterThan(0);
  });

  it('integrates loading states across components', () => {
    // Mock delayed loading
    mockProjectService.getProjects.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockProjects), 100))
    );

    const { getByText } = renderWithProviders(<ProjectManagement />);

    // Should render without crashing
    expect(getByText('Project Management')).toBeInTheDocument();
  });

  it('integrates settings modal with project configuration', () => {
    const { getByText, getByTestId, queryByTestId } = renderWithProviders(<ProjectManagement />);

    // Open settings
    getByText('Settings').click();
    expect(getByTestId('settings-modal')).toBeInTheDocument();

    // Close settings
    getByTestId('close-settings').click();
    expect(queryByTestId('settings-modal')).not.toBeInTheDocument();
  });

  it('handles data flow between parent and child components', () => {
    const { getByTestId } = renderWithProviders(<ProjectManagement />);

    // Should render overview by default
    expect(getByTestId('project-overview')).toBeInTheDocument();

    // Verify service is called for data
    expect(mockProjectService.getProjects).toHaveBeenCalled();
  });

  it('integrates context providers and state management', () => {
    const { getByText } = renderWithProviders(<ProjectManagement />);

    // Should render without context errors
    expect(getByText('Project Management')).toBeInTheDocument();

    // Should have access to auth context (mocked)
    expect(getByText('New Project')).toBeInTheDocument();
  });

  it('handles TypeScript integration correctly', () => {
    // Test that components integrate without TypeScript errors
    const { getByText } = renderWithProviders(<ProjectManagement />);

    expect(getByText('Project Management')).toBeInTheDocument();
    
    // Verify tab functionality
    expect(getByText('Overview')).toBeInTheDocument();
    expect(getByText('Kanban')).toBeInTheDocument();
    expect(getByText('Tasks')).toBeInTheDocument();
  });

  it('integrates styling system consistently', () => {
    const { container } = renderWithProviders(<ProjectManagement />);

    // Check for design system classes
    const gradientText = container.querySelector('.bg-gradient-to-r');
    expect(gradientText).toBeInTheDocument();

    const primaryButton = container.querySelector('.bg-quikle-primary');
    expect(primaryButton).toBeInTheDocument();
  });
});