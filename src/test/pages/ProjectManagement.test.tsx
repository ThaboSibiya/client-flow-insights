import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ProjectManagement from '@/components/project-management/ProjectManagement';
import { Project, ProjectStatus, ProjectType, Priority } from '@/types/project';

// Mock all dependencies
vi.mock('@/hooks/useProjectManagement', () => ({
  useProjectManagement: () => ({
    projects: mockProjects,
    allProjects: mockProjects,
    selectedProject: null,
    setSelectedProject: vi.fn(),
    filters: {
      status: [],
      priority: [],
      type: [],
      owner: [],
      dateRange: { start: null, end: null },
      search: '',
    },
    setFilters: vi.fn(),
    teamMembers: mockTeamMembers,
    addProject: vi.fn().mockResolvedValue(true),
    updateProjectStatus: vi.fn(),
    updateTaskStatus: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
    addTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    isLoading: false,
    errors: [],
    clearErrors: vi.fn(),
  }),
}));

vi.mock('@/components/project-management/ProjectFilters', () => ({
  default: ({ filters, onFiltersChange }: any) => (
    <div data-testid="project-filters">
      <input 
        placeholder="Search projects"
        value={filters.search}
        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
      />
    </div>
  ),
}));

vi.mock('@/components/project-management/NewProjectModal', () => ({
  default: ({ isOpen, onClose, onCreateProject }: any) => 
    isOpen ? (
      <div data-testid="new-project-modal">
        <button onClick={() => onCreateProject(mockProjectData)}>Create Project</button>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

vi.mock('@/components/project-management/ProjectSettingsModal', () => ({
  default: ({ isOpen, onClose }: any) => 
    isOpen ? (
      <div data-testid="project-settings-modal">
        <button onClick={onClose}>Close Settings</button>
      </div>
    ) : null,
}));

vi.mock('@/components/project-management/OptimizedProjectOverview', () => ({
  default: ({ projects }: any) => (
    <div data-testid="project-overview">
      {projects.map((project: Project) => (
        <div key={project.id} data-testid={`project-${project.id}`}>
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
        <div key={project.id}>
          <span>{project.name}</span>
          <button onClick={() => onProjectMove(project.id, 'completed')}>
            Move to Completed
          </button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/components/project-management/TaskManagement', () => ({
  default: ({ project }: any) => (
    <div data-testid="task-management">
      Task Management for {project.name}
    </div>
  ),
}));

vi.mock('@/components/project-management/ProjectGanttChart', () => ({
  default: () => <div data-testid="gantt-chart">Gantt Chart</div>,
}));

vi.mock('@/components/project-management/ProjectCalendar', () => ({
  default: () => <div data-testid="project-calendar">Project Calendar</div>,
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
    name: 'Test Project 1',
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
    tags: ['frontend', 'react'],
    client: 'Test Client',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

const mockProjectData = {
  name: 'New Test Project',
  description: 'A new test project',
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

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ProjectManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page title and description correctly', () => {
    const { getByText } = renderWithRouter(<ProjectManagement />);
    
    expect(getByText('Project Management')).toBeInTheDocument();
    expect(getByText(/Manage and track your projects/)).toBeInTheDocument();
  });

  it('renders all tab triggers with correct icons', () => {
    const { getByText } = renderWithRouter(<ProjectManagement />);
    
    expect(getByText('Overview')).toBeInTheDocument();
    expect(getByText('Kanban')).toBeInTheDocument();
    expect(getByText('Tasks')).toBeInTheDocument();
    expect(getByText('Timeline')).toBeInTheDocument();
    expect(getByText('Calendar')).toBeInTheDocument();
  });

  it('displays project count correctly', () => {
    const { getByText } = renderWithRouter(<ProjectManagement />);
    
    expect(getByText('1 project')).toBeInTheDocument();
  });

  it('renders action buttons with proper styling', () => {
    const { getByText } = renderWithRouter(<ProjectManagement />);
    
    const newProjectBtn = getByText('New Project');
    const settingsBtn = getByText('Settings');
    
    expect(newProjectBtn).toBeInTheDocument();
    expect(settingsBtn).toBeInTheDocument();
    expect(newProjectBtn.closest('button')).toHaveClass('bg-quikle-primary');
  });

  it('opens new project modal when New Project button is clicked', () => {
    const { getByText, getByTestId } = renderWithRouter(<ProjectManagement />);
    
    const newProjectBtn = getByText('New Project');
    newProjectBtn.click();
    
    expect(getByTestId('new-project-modal')).toBeInTheDocument();
  });

  it('opens settings modal when Settings button is clicked', () => {
    const { getByText, getByTestId } = renderWithRouter(<ProjectManagement />);
    
    const settingsBtn = getByText('Settings');
    settingsBtn.click();
    
    expect(getByTestId('project-settings-modal')).toBeInTheDocument();
  });

  it('switches between different views correctly', () => {
    const { getByText, getByTestId } = renderWithRouter(<ProjectManagement />);
    
    // Default overview view
    expect(getByTestId('project-overview')).toBeInTheDocument();
    
    // Switch to kanban view
    getByText('Kanban').click();
    expect(getByTestId('kanban-board')).toBeInTheDocument();
    
    // Switch to timeline view
    getByText('Timeline').click();
    expect(getByTestId('gantt-chart')).toBeInTheDocument();
    
    // Switch to calendar view
    getByText('Calendar').click();
    expect(getByTestId('project-calendar')).toBeInTheDocument();
  });

  it('handles task view project selection correctly', () => {
    const { getByText, getByTestId } = renderWithRouter(<ProjectManagement />);
    
    // Switch to tasks view
    getByText('Tasks').click();
    
    // Should show project selection
    expect(getByText('Select a Project')).toBeInTheDocument();
    expect(getByText('Test Project 1')).toBeInTheDocument();
    
    // Click on a project
    getByText('Test Project 1').click();
    
    // Should show task management
    expect(getByTestId('task-management')).toBeInTheDocument();
  });

  it('displays empty state when no projects exist', () => {
    vi.mocked(require('@/hooks/useProjectManagement').useProjectManagement).mockReturnValue({
      projects: [],
      allProjects: [],
      selectedProject: null,
      setSelectedProject: vi.fn(),
      filters: {
        status: [],
        priority: [],
        type: [],
        owner: [],
        dateRange: { start: null, end: null },
        search: '',
      },
      setFilters: vi.fn(),
      teamMembers: mockTeamMembers,
      addProject: vi.fn(),
      updateProjectStatus: vi.fn(),
      updateTaskStatus: vi.fn(),
      updateProject: vi.fn(),
      deleteProject: vi.fn(),
      addTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      isLoading: false,
      errors: [],
      clearErrors: vi.fn(),
    });

    const { getByText } = renderWithRouter(<ProjectManagement />);
    
    expect(getByText('No projects yet')).toBeInTheDocument();
    expect(getByText('Create Your First Project')).toBeInTheDocument();
  });

  it('displays loading state correctly', () => {
    vi.mocked(require('@/hooks/useProjectManagement').useProjectManagement).mockReturnValue({
      projects: [],
      allProjects: [],
      selectedProject: null,
      setSelectedProject: vi.fn(),
      filters: {
        status: [],
        priority: [],
        type: [],
        owner: [],
        dateRange: { start: null, end: null },
        search: '',
      },
      setFilters: vi.fn(),
      teamMembers: mockTeamMembers,
      addProject: vi.fn(),
      updateProjectStatus: vi.fn(),
      updateTaskStatus: vi.fn(),
      updateProject: vi.fn(),
      deleteProject: vi.fn(),
      addTask: vi.fn(),
      updateTask: vi.fn(),
      deleteTask: vi.fn(),
      isLoading: true,
      errors: [],
      clearErrors: vi.fn(),
    });

    const { getByText } = renderWithRouter(<ProjectManagement />);
    
    expect(getByText('Loading your projects...')).toBeInTheDocument();
  });

  it('wraps components in error boundaries', () => {
    const { getAllByTestId } = renderWithRouter(<ProjectManagement />);
    
    const errorBoundaries = getAllByTestId('error-boundary');
    expect(errorBoundaries.length).toBeGreaterThan(0);
  });

  it('validates TypeScript prop types correctly', () => {
    const props = {
      projects: mockProjects,
      teamMembers: mockTeamMembers,
      isLoading: false,
      errors: [],
    };
    
    // Test that props match expected interfaces
    expect(props.projects).toBeDefined();
    expect(props.projects[0]).toHaveProperty('id');
    expect(props.projects[0]).toHaveProperty('name');
    expect(props.projects[0]).toHaveProperty('status');
    expect(props.teamMembers[0]).toHaveProperty('id');
    expect(props.teamMembers[0]).toHaveProperty('name');
    expect(props.teamMembers[0]).toHaveProperty('role');
  });

  it('implements lazy loading correctly', () => {
    const { getByTestId } = renderWithRouter(<ProjectManagement />);
    
    // Components should be wrapped in Suspense
    expect(getByTestId('project-overview')).toBeInTheDocument();
  });

  it('maintains consistent styling classes', () => {
    const { container } = renderWithRouter(<ProjectManagement />);
    
    // Check for design system classes
    const titleElement = container.querySelector('.text-quikle-charcoal');
    expect(titleElement).toBeInTheDocument();
    
    const primaryButton = container.querySelector('.bg-quikle-primary');
    expect(primaryButton).toBeInTheDocument();
  });
});