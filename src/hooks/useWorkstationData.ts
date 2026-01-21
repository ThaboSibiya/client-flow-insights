import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Project, Task } from '@/types/project';
import { projectService } from '@/services/projectService';

export interface WorkstationTask {
  id: string;
  title: string;
  project: string;
  projectId: string;
  priority: 'high' | 'medium' | 'low' | 'urgent';
  dueDate: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
}

export interface WorkstationProject {
  id: string;
  name: string;
  role: string;
  progress: number;
  tasksCount: number;
  status: string;
}

interface WorkstationStats {
  tasksCompleted: number;
  tasksTotal: number;
  projectsActive: number;
  upcomingDeadlines: number;
}

export const useWorkstationData = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchedProjects = await projectService.getProjects();
        setProjects(fetchedProjects);
        setError(null);
      } catch (err) {
        console.error('Error fetching workstation data:', err);
        setError('Failed to load workstation data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Transform projects into workstation format
  const myProjects: WorkstationProject[] = useMemo(() => {
    return projects.map(project => ({
      id: project.id,
      name: project.name,
      role: project.owner?.id === user?.id ? 'Lead' : 'Contributor',
      progress: project.progress || 0,
      tasksCount: project.tasks?.length || 0,
      status: project.status
    }));
  }, [projects, user?.id]);

  // Extract all tasks from projects
  const myTasks: WorkstationTask[] = useMemo(() => {
    const allTasks: WorkstationTask[] = [];
    const today = new Date();
    
    projects.forEach(project => {
      project.tasks?.forEach(task => {
        const dueDate = new Date(task.dueDate);
        const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        let dueDateLabel = '';
        if (diffDays < 0) {
          dueDateLabel = 'Overdue';
        } else if (diffDays === 0) {
          dueDateLabel = 'Today';
        } else if (diffDays === 1) {
          dueDateLabel = 'Tomorrow';
        } else if (diffDays <= 7) {
          dueDateLabel = `${diffDays} days`;
        } else {
          dueDateLabel = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }

        allTasks.push({
          id: task.id,
          title: task.title,
          project: project.name,
          projectId: project.id,
          priority: task.priority as 'high' | 'medium' | 'low' | 'urgent',
          dueDate: dueDateLabel,
          status: task.status
        });
      });
    });

    // Sort by priority and due date
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    return allTasks
      .filter(t => t.status !== 'done')
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .slice(0, 10); // Limit to 10 tasks
  }, [projects]);

  // Calculate stats
  const stats: WorkstationStats = useMemo(() => {
    let tasksCompleted = 0;
    let tasksTotal = 0;
    let upcomingDeadlines = 0;
    const today = new Date();

    projects.forEach(project => {
      project.tasks?.forEach(task => {
        tasksTotal++;
        if (task.status === 'done') {
          tasksCompleted++;
        }
        
        const dueDate = new Date(task.dueDate);
        const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 3 && diffDays >= 0 && task.status !== 'done') {
          upcomingDeadlines++;
        }
      });
    });

    const activeProjects = projects.filter(p => 
      p.status === 'in-progress' || p.status === 'not-started'
    ).length;

    return {
      tasksCompleted,
      tasksTotal: tasksTotal || 1, // Prevent division by zero
      projectsActive: activeProjects,
      upcomingDeadlines
    };
  }, [projects]);

  const refetch = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const fetchedProjects = await projectService.getProjects();
      setProjects(fetchedProjects);
    } catch (err) {
      console.error('Error refetching workstation data:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    myTasks,
    myProjects,
    stats,
    loading,
    error,
    refetch
  };
};
