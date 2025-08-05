
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Calendar, User, Clock, Flag } from "lucide-react";
import { Project, Task, TaskStatus } from '@/types/project';
import { format } from 'date-fns';
import CreateTaskModal from './CreateTaskModal';

interface TaskManagementProps {
  project: Project;
  onTaskCreate: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
}

const statusColors = {
  'todo': 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  'review': 'bg-yellow-100 text-yellow-800',
  'done': 'bg-green-100 text-green-800',
};

const priorityColors = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-orange-600',
  urgent: 'text-red-600',
};

const TaskManagement = ({ project, onTaskCreate, onTaskUpdate }: TaskManagementProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    onTaskUpdate(taskId, { status: newStatus });
  };

  const tasksByStatus = project.tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = [];
    }
    acc[task.status].push(task);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  const statusColumns: { status: TaskStatus; title: string }[] = [
    { status: 'todo', title: 'To Do' },
    { status: 'in-progress', title: 'In Progress' },
    { status: 'review', title: 'Review' },
    { status: 'done', title: 'Done' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Task Management</h3>
          <p className="text-sm text-muted-foreground">
            Assign and manage tasks for {project.name}
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-quikle-primary hover:bg-quikle-secondary text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statusColumns.map(({ status, title }) => (
          <Card key={status} className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                {title}
                <Badge variant="secondary" className="text-xs">
                  {tasksByStatus[status]?.length || 0}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 min-h-[400px]">
              {tasksByStatus[status]?.map((task) => (
                <Card key={task.id} className="p-3 hover:shadow-md transition-shadow">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-medium line-clamp-2">{task.title}</h4>
                      <Flag className={`h-3 w-3 ${priorityColors[task.priority]}`} />
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {task.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(task.dueDate, 'MMM dd')}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {task.estimatedHours}h estimated
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-1">
                        {task.assignedTo.slice(0, 2).map((member) => (
                          <Avatar key={member.id} className="h-6 w-6 border border-white">
                            <AvatarFallback className="text-xs">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {task.assignedTo.length > 2 && (
                          <div className="h-6 w-6 bg-gray-200 rounded-full border border-white flex items-center justify-center">
                            <span className="text-xs">+{task.assignedTo.length - 2}</span>
                          </div>
                        )}
                      </div>

                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                        className="text-xs border rounded px-2 py-1"
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTask={onTaskCreate}
        project={project}
      />
    </div>
  );
};

export default TaskManagement;
