
import React, { useState } from 'react';
import { Target } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import TaskForm from './task-assignment/TaskForm';
import TaskCard from './task-assignment/TaskCard';
import { Task, NewTask } from './task-assignment/types';

const DailyTaskAssignment = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete customer site survey',
      description: 'Visit client location and assess installation requirements',
      assignedTo: 'emp-001',
      employeeName: 'John Smith',
      priority: 'high',
      status: 'in-progress',
      dueDate: '2024-06-22',
      estimatedHours: 4,
      category: 'Field Work',
    },
    {
      id: '2',
      title: 'Process pending invoices',
      description: 'Review and approve invoices from last week',
      assignedTo: 'emp-002',
      employeeName: 'Sarah Johnson',
      priority: 'medium',
      status: 'pending',
      dueDate: '2024-06-23',
      estimatedHours: 2,
      category: 'Administration',
    },
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState<NewTask>({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
    estimatedHours: 1,
    category: 'General',
  });

  const createTask = () => {
    if (!newTask.title || !newTask.assignedTo || !newTask.dueDate) {
      toast({
        title: "Incomplete Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const task: Task = {
      id: `task-${Date.now()}`,
      ...newTask,
      employeeName: `Employee ${newTask.assignedTo}`,
      status: 'pending',
    };

    setTasks(prev => [...prev, task]);
    setNewTask({
      title: '',
      description: '',
      assignedTo: '',
      priority: 'medium',
      dueDate: '',
      estimatedHours: 1,
      category: 'General',
    });
    setIsCreateDialogOpen(false);

    toast({
      title: "Task Created",
      description: `Task assigned to ${task.employeeName}`,
    });
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, status } : task
    ));

    toast({
      title: "Task Updated",
      description: `Task status changed to ${status}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Daily Task Assignment</h3>
          <p className="text-sm text-muted-foreground">Assign and manage daily tasks by priority</p>
        </div>
        <TaskForm
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          newTask={newTask}
          onTaskChange={setNewTask}
          onCreateTask={createTask}
        />
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdateStatus={updateTaskStatus}
          />
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tasks assigned yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyTaskAssignment;
