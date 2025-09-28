import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DndContext } from '@dnd-kit/core';
import ProjectCard from '@/components/project-management/ProjectCard';
import { Project, ProjectStatus, ProjectType, Priority } from '@/types/project';

// Mock @dnd-kit/sortable
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  CSS: {
    Transform: {
      toString: () => 'translate3d(0px, 0px, 0px)',
    },
  },
}));

const mockTeamMembers = [
  { id: '1', name: 'John Smith', email: 'john@test.com', role: 'Manager', department: 'IT' },
  { id: '2', name: 'Jane Doe', email: 'jane@test.com', role: 'Developer', department: 'IT' },
  { id: '3', name: 'Bob Wilson', email: 'bob@test.com', role: 'Designer', department: 'Design' },
  { id: '4', name: 'Alice Brown', email: 'alice@test.com', role: 'QA', department: 'QA' },
  { id: '5', name: 'Extra Member', email: 'extra@test.com', role: 'Dev', department: 'IT' },
];

const createMockProject = (overrides: Partial<Project> = {}): Project => ({
  id: 'proj-1',
  name: 'Test Project',
  description: 'A comprehensive test project for unit testing',
  status: 'in-progress' as ProjectStatus,
  type: 'development' as ProjectType,
  priority: 'high' as Priority,
  startDate: new Date('2024-01-01'),
  dueDate: new Date('2024-12-31'),
  budget: 150000,
  spent: 75000,
  progress: 65,
  owner: mockTeamMembers[0],
  team: mockTeamMembers.slice(0, 3),
  tasks: [],
  tags: ['frontend', 'react', 'typescript'],
  client: 'Test Client',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-06-01'),
  ...overrides,
});

const renderWithDnd = (component: React.ReactElement) => {
  return render(
    <DndContext>
      {component}
    </DndContext>
  );
};

describe('ProjectCard Component', () => {
  it('renders project information correctly', () => {
    const project = createMockProject();
    const { getByText } = renderWithDnd(<ProjectCard project={project} />);
    
    expect(getByText('Test Project')).toBeInTheDocument();
    expect(getByText('A comprehensive test project for unit testing')).toBeInTheDocument();
  });

  it('displays priority badge with correct styling', () => {
    const project = createMockProject({ priority: 'urgent' });
    const { getByText } = renderWithDnd(<ProjectCard project={project} />);
    
    const priorityBadge = getByText('urgent');
    expect(priorityBadge).toBeInTheDocument();
    expect(priorityBadge.closest('.bg-red-100')).toBeInTheDocument();
  });

  it('shows project type badge', () => {
    const project = createMockProject({ type: 'design' });
    const { getByText } = renderWithDnd(<ProjectCard project={project} />);
    
    expect(getByText('design')).toBeInTheDocument();
  });

  it('displays progress percentage and progress bar', () => {
    const project = createMockProject({ progress: 75 });
    const { getByText } = renderWithDnd(<ProjectCard project={project} />);
    
    expect(getByText('75%')).toBeInTheDocument();
    expect(getByText('Progress')).toBeInTheDocument();
  });

  it('formats and displays currency correctly', () => {
    const project = createMockProject({ budget: 250000 });
    const { getByText } = renderWithDnd(<ProjectCard project={project} />);
    
    // Check for ZAR currency format (allowing for flexible spacing)
    expect(getByText(/R.*250.*000/)).toBeInTheDocument();
  });

  it('shows due date in correct format', () => {
    const project = createMockProject({ dueDate: new Date('2024-06-15') });
    const { getByText } = renderWithDnd(<ProjectCard project={project} />);
    
    expect(getByText('Jun 15')).toBeInTheDocument();
  });

  it('displays team member count', () => {
    const project = createMockProject({ team: mockTeamMembers.slice(0, 4) });
    const { getByText } = renderWithDnd(<ProjectCard project={project} />);
    
    expect(getByText('4')).toBeInTheDocument();
  });

  it('shows team member avatars with initials', () => {
    const project = createMockProject();
    const { getByText } = renderWithDnd(<ProjectCard project={project} />);
    
    expect(getByText('JS')).toBeInTheDocument(); // John Smith
    expect(getByText('JD')).toBeInTheDocument(); // Jane Doe
    expect(getByText('BW')).toBeInTheDocument(); // Bob Wilson
  });

  it('displays overflow indicator when more than 3 team members', () => {
    const project = createMockProject({ team: mockTeamMembers }); // 5 members
    const { getByText } = renderWithDnd(<ProjectCard project={project} />);
    
    expect(getByText('+2')).toBeInTheDocument();
  });

  it('shows limited number of tags with overflow indicator', () => {
    const project = createMockProject({ tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'] });
    const { getByText } = renderWithDnd(<ProjectCard project={project} />);
    
    expect(getByText('tag1')).toBeInTheDocument();
    expect(getByText('tag2')).toBeInTheDocument();
    expect(getByText('+3')).toBeInTheDocument();
  });

  it('hides tags section when no tags present', () => {
    const project = createMockProject({ tags: [] });
    const { container } = renderWithDnd(<ProjectCard project={project} />);
    
    const tagsContainer = container.querySelector('.flex-wrap');
    expect(tagsContainer).not.toBeInTheDocument();
  });

  it('handles different priority colors correctly', () => {
    const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];
    const colors = ['bg-green-100', 'bg-yellow-100', 'bg-orange-100', 'bg-red-100'];
    
    priorities.forEach((priority, index) => {
      const project = createMockProject({ priority });
      const { container, getByText } = renderWithDnd(<ProjectCard project={project} />);
      
      const priorityElement = getByText(priority);
      expect(priorityElement.closest(`.${colors[index]}`)).toBeInTheDocument();
    });
  });

  it('implements drag and drop functionality', () => {
    const project = createMockProject();
    const { container } = renderWithDnd(<ProjectCard project={project} />);
    
    // The grip should be present for drag functionality
    expect(container.querySelector('.cursor-grab')).toBeInTheDocument();
  });

  it('applies dragging styles when isDragging is true', () => {
    vi.mocked(require('@dnd-kit/sortable').useSortable).mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      transition: null,
      isDragging: true,
    });

    const project = createMockProject();
    const { container } = renderWithDnd(<ProjectCard project={project} />);
    
    const card = container.querySelector('[style*="opacity"]');
    expect(card).toBeInTheDocument();
  });

  it('truncates long project names correctly', () => {
    const project = createMockProject({ 
      name: 'This is a very long project name that should be truncated to prevent layout issues' 
    });
    
    const { container } = renderWithDnd(<ProjectCard project={project} />);
    
    const nameElement = container.querySelector('.truncate');
    expect(nameElement).toBeInTheDocument();
  });

  it('limits description text with line clamp', () => {
    const project = createMockProject({ 
      description: 'This is a very long description that should be clamped to a maximum number of lines to maintain consistent card heights and prevent layout issues across the grid'
    });
    
    const { container } = renderWithDnd(<ProjectCard project={project} />);
    
    const descriptionElement = container.querySelector('.line-clamp-2');
    expect(descriptionElement).toBeInTheDocument();
  });

  it('handles edge cases for progress percentage', () => {
    const testCases = [
      { progress: 0, expected: '0%' },
      { progress: 100, expected: '100%' },
      { progress: 33.33, expected: '33%' },
      { progress: 66.67, expected: '67%' },
    ];

    testCases.forEach(({ progress, expected }) => {
      const project = createMockProject({ progress });
      const { getByText, rerender } = renderWithDnd(<ProjectCard project={project} />);
      
      expect(getByText(expected)).toBeInTheDocument();
      
      rerender(
        <DndContext>
          <ProjectCard project={createMockProject()} />
        </DndContext>
      );
    });
  });

  it('validates TypeScript props interface', () => {
    const project = createMockProject();
    
    // Test that all required Project interface properties are present
    expect(project).toHaveProperty('id');
    expect(project).toHaveProperty('name');
    expect(project).toHaveProperty('description');
    expect(project).toHaveProperty('status');
    expect(project).toHaveProperty('type');
    expect(project).toHaveProperty('priority');
    expect(project).toHaveProperty('startDate');
    expect(project).toHaveProperty('dueDate');
    expect(project).toHaveProperty('budget');
    expect(project).toHaveProperty('spent');
    expect(project).toHaveProperty('progress');
    expect(project).toHaveProperty('owner');
    expect(project).toHaveProperty('team');
    expect(project).toHaveProperty('tasks');
    expect(project).toHaveProperty('tags');
    expect(project).toHaveProperty('createdAt');
    expect(project).toHaveProperty('updatedAt');
    
    // Verify proper typing
    expect(typeof project.id).toBe('string');
    expect(typeof project.name).toBe('string');
    expect(typeof project.progress).toBe('number');
    expect(Array.isArray(project.team)).toBe(true);
    expect(project.startDate instanceof Date).toBe(true);
  });

  it('handles team member with no avatar gracefully', () => {
    const project = createMockProject({
      team: [
        { id: '1', name: 'John Smith', email: 'john@test.com', role: 'Manager', department: 'IT' }
      ]
    });
    
    const { getByText } = renderWithDnd(<ProjectCard project={project} />);
    
    expect(getByText('JS')).toBeInTheDocument();
  });

  it('maintains accessibility for interactive elements', () => {
    const project = createMockProject();
    const { container } = renderWithDnd(<ProjectCard project={project} />);
    
    const dragHandle = container.querySelector('.cursor-grab');
    expect(dragHandle).toBeInTheDocument();
    
    // Should have proper touch handling
    const touchElement = container.querySelector('.touch-none');
    expect(touchElement).toBeInTheDocument();
  });
});