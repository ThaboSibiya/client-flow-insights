import { supabase } from '@/integrations/supabase/client';
import { Project, Task } from '@/types/project';

export interface DatabaseProject {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: string;
  type: string;
  priority: string;
  start_date: string;
  due_date: string;
  budget: number;
  spent: number;
  progress: number;
  owner_id: string;
  owner_name: string;
  owner_email: string;
  team: any;
  tags: string[];
  client: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseTask {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assigned_to: any;
  due_date: string;
  start_date: string;
  estimated_hours: number;
  actual_hours: number;
  progress: number;
  tags: string[];
  dependencies: string[];
  attachments: string[];
  created_at: string;
  updated_at: string;
}

const transformDatabaseProjectToProject = (dbProject: DatabaseProject): Project => {
  return {
    id: dbProject.id,
    name: dbProject.name,
    description: dbProject.description || '',
    status: dbProject.status as any,
    type: dbProject.type as any,
    priority: dbProject.priority as any,
    startDate: new Date(dbProject.start_date),
    dueDate: new Date(dbProject.due_date),
    budget: dbProject.budget,
    spent: dbProject.spent,
    progress: dbProject.progress,
    owner: {
      id: dbProject.owner_id,
      name: dbProject.owner_name,
      email: dbProject.owner_email,
      role: 'Project Manager',
      department: 'Management',
      avatar: undefined
    },
    team: Array.isArray(dbProject.team) ? dbProject.team : [],
    tasks: [], // Tasks loaded separately
    tags: dbProject.tags || [],
    client: dbProject.client,
    createdAt: new Date(dbProject.created_at),
    updatedAt: new Date(dbProject.updated_at)
  };
};

const transformProjectToDatabaseProject = (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Omit<DatabaseProject, 'id' | 'created_at' | 'updated_at'> => {
  return {
    user_id: userId,
    name: project.name,
    description: project.description,
    status: project.status,
    type: project.type,
    priority: project.priority,
    start_date: project.startDate.toISOString(),
    due_date: project.dueDate.toISOString(),
    budget: project.budget,
    spent: project.spent,
    progress: project.progress,
    owner_id: project.owner.id,
    owner_name: project.owner.name,
    owner_email: project.owner.email,
    team: project.team,
    tags: project.tags,
    client: project.client
  };
};

const transformDatabaseTaskToTask = (dbTask: DatabaseTask): Task => {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description || '',
    status: dbTask.status as any,
    priority: dbTask.priority as any,
    assignedTo: Array.isArray(dbTask.assigned_to) ? dbTask.assigned_to : [],
    dueDate: new Date(dbTask.due_date),
    startDate: new Date(dbTask.start_date),
    estimatedHours: dbTask.estimated_hours,
    actualHours: dbTask.actual_hours,
    progress: dbTask.progress,
    tags: dbTask.tags || [],
    dependencies: dbTask.dependencies || [],
    attachments: dbTask.attachments || [],
    comments: [], // Comments not implemented yet
    projectId: dbTask.project_id,
    createdAt: new Date(dbTask.created_at),
    updatedAt: new Date(dbTask.updated_at)
  };
};

export const projectService = {
  async getProjects(): Promise<Project[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');
    const userId = user.user.id;

    // Fetch projects and all tasks in parallel (2 queries instead of N+1)
    const [projectsResult, tasksResult] = await Promise.all([
      supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('project_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    ]);

    if (projectsResult.error) throw projectsResult.error;
    if (tasksResult.error) throw tasksResult.error;

    // Group tasks by project_id in a single pass
    const tasksByProject = new Map<string, Task[]>();
    for (const dbTask of tasksResult.data || []) {
      const task = transformDatabaseTaskToTask(dbTask);
      const existing = tasksByProject.get(dbTask.project_id);
      if (existing) {
        existing.push(task);
      } else {
        tasksByProject.set(dbTask.project_id, [task]);
      }
    }

    // Attach tasks to projects
    const projects = projectsResult.data.map(dbProject => {
      const project = transformDatabaseProjectToProject(dbProject);
      project.tasks = tasksByProject.get(project.id) || [];
      return project;
    });

    return projects;
  },

  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>, workspaceId?: string | null): Promise<Project> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const dbProject: any = transformProjectToDatabaseProject(projectData, user.user.id);
    if (workspaceId) {
      dbProject.workspace_id = workspaceId;
    }

    const { data, error } = await supabase
      .from('projects')
      .insert(dbProject)
      .select()
      .single();

    if (error) throw error;

    return transformDatabaseProjectToProject(data);
  },

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const updateData: any = {};
    
    if (updates.name) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status) updateData.status = updates.status;
    if (updates.type) updateData.type = updates.type;
    if (updates.priority) updateData.priority = updates.priority;
    if (updates.startDate) updateData.start_date = updates.startDate.toISOString();
    if (updates.dueDate) updateData.due_date = updates.dueDate.toISOString();
    if (updates.budget !== undefined) updateData.budget = updates.budget;
    if (updates.spent !== undefined) updateData.spent = updates.spent;
    if (updates.progress !== undefined) updateData.progress = updates.progress;
    if (updates.owner) {
      updateData.owner_id = updates.owner.id;
      updateData.owner_name = updates.owner.name;
      updateData.owner_email = updates.owner.email;
    }
    if (updates.team) updateData.team = updates.team;
    if (updates.tags) updateData.tags = updates.tags;
    if (updates.client !== undefined) updateData.client = updates.client;

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .eq('user_id', user.user.id)
      .select()
      .single();

    if (error) throw error;

    const project = transformDatabaseProjectToProject(data);
    project.tasks = await this.getProjectTasks(projectId);
    return project;
  },

  async deleteProject(projectId: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', user.user.id);

    if (error) throw error;
  },

  async getProjectTasks(projectId: string): Promise<Task[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(transformDatabaseTaskToTask);
  },

  async createTask(projectId: string, taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const dbTask = {
      project_id: projectId,
      user_id: user.user.id,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      priority: taskData.priority,
      assigned_to: JSON.parse(JSON.stringify(taskData.assignedTo)),
      due_date: taskData.dueDate.toISOString(),
      start_date: taskData.startDate.toISOString(),
      estimated_hours: taskData.estimatedHours,
      actual_hours: taskData.actualHours,
      progress: taskData.progress,
      tags: taskData.tags,
      dependencies: taskData.dependencies,
      attachments: taskData.attachments
    };

    const { data, error } = await supabase
      .from('project_tasks')
      .insert([dbTask])
      .select()
      .single();

    if (error) throw error;

    return transformDatabaseTaskToTask(data);
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const updateData: any = {};
    
    if (updates.title) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status) updateData.status = updates.status;
    if (updates.priority) updateData.priority = updates.priority;
    if (updates.assignedTo) updateData.assigned_to = JSON.parse(JSON.stringify(updates.assignedTo));
    if (updates.dueDate) updateData.due_date = updates.dueDate.toISOString();
    if (updates.startDate) updateData.start_date = updates.startDate.toISOString();
    if (updates.estimatedHours !== undefined) updateData.estimated_hours = updates.estimatedHours;
    if (updates.actualHours !== undefined) updateData.actual_hours = updates.actualHours;
    if (updates.progress !== undefined) updateData.progress = updates.progress;
    if (updates.tags) updateData.tags = updates.tags;
    if (updates.dependencies) updateData.dependencies = updates.dependencies;
    if (updates.attachments) updateData.attachments = updates.attachments;

    const { data, error } = await supabase
      .from('project_tasks')
      .update(updateData)
      .eq('id', taskId)
      .eq('user_id', user.user.id)
      .select()
      .single();

    if (error) throw error;

    return transformDatabaseTaskToTask(data);
  },

  async deleteTask(taskId: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('project_tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', user.user.id);

    if (error) throw error;
  },

  async updateTaskPriorities(tasks: { id: string; priority: string }[]): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // Update each task's priority based on new order
    const updates = tasks.map((task, index) => {
      // Map position to priority: 0-1 = urgent, 2-3 = high, 4-6 = medium, 7+ = low
      let priority: string;
      if (index <= 1) priority = 'urgent';
      else if (index <= 3) priority = 'high';
      else if (index <= 6) priority = 'medium';
      else priority = 'low';

      return supabase
        .from('project_tasks')
        .update({ priority })
        .eq('id', task.id)
        .eq('user_id', user.user!.id);
    });

    const results = await Promise.all(updates);
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      throw new Error('Failed to update some task priorities');
    }
  }
};