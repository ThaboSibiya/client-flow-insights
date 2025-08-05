
export type ProjectStatus = 'not-started' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';
export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectType = 'development' | 'marketing' | 'design' | 'research' | 'maintenance';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department: string;
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
  comments: Comment[];
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  author: TeamMember;
  createdAt: Date;
  parentId?: string;
  attachments?: string[];
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
