
// Status and enum types
export type ProjectStatus = 'not-started' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectType = 'development' | 'marketing' | 'design' | 'research' | 'maintenance';

// Core interfaces
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department: string;
}

export interface TaskComment {
  id: string;
  content: string;
  author: TeamMember;
  createdAt: Date;
  parentId?: string;
  attachments?: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignedTo: TeamMember[];
  dueDate: Date;
  startDate: Date;
  estimatedHours: number;
  actualHours: number;
  progress: number;
  tags: string[];
  dependencies: string[];
  attachments: string[];
  comments: TaskComment[];
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  type: ProjectType;
  priority: Priority;
  startDate: Date;
  dueDate: Date;
  budget: number;
  spent: number;
  progress: number;
  owner: TeamMember;
  team: TeamMember[];
  tasks: Task[];
  tags: string[];
  client?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Filter and form interfaces
export interface ProjectFilters {
  status: ProjectStatus[];
  priority: Priority[];
  type: ProjectType[];
  owner: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  search: string;
}

export interface ProjectFormData {
  name: string;
  description: string;
  type: ProjectType;
  priority: Priority;
  budget: number;
  client: string;
  startDate: Date;
  dueDate: Date;
  ownerId: string;
  teamIds: string[];
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: Priority;
  estimatedHours: number;
  dueDate: Date;
  assignedToIds: string[];
  tags: string[];
}

// Chart and visualization interfaces
export interface GanttChartData {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  type: 'project' | 'task';
  dependencies: string[];
  assignees: TeamMember[];
  parent?: string;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  totalSpent: number;
  budgetUtilization: number;
}

// Event handler types
export interface ProjectEventHandlers {
  onProjectCreate?: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onProjectUpdate?: (projectId: string, updates: Partial<Project>) => void;
  onProjectDelete?: (projectId: string) => void;
  onProjectMove?: (projectId: string, newStatus: ProjectStatus) => void;
  onTaskCreate?: (projectId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onTaskUpdate?: (projectId: string, taskId: string, updates: Partial<Task>) => void;
  onTaskDelete?: (projectId: string, taskId: string) => void;
}

// Component prop interfaces
export interface ProjectComponentProps {
  projects: Project[];
  selectedProject?: Project | null;
  onProjectSelect?: (project: Project | null) => void;
  onError?: (error: Error) => void;
}

export interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
}

// API response types
export interface ProjectApiResponse {
  projects: Project[];
  totalCount: number;
  hasMore: boolean;
}

export interface ProjectApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Validation types
export interface ValidationResult {
  success: boolean;
  errors?: string[];
  data?: unknown;
}

export interface ProjectValidationError {
  field: string;
  message: string;
  code?: string;
}
