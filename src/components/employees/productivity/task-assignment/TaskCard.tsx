
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, AlertCircle, CheckCircle } from "lucide-react";
import { Task } from './types';

interface TaskCardProps {
  task: Task;
  onUpdateStatus: (taskId: string, status: Task['status']) => void;
}

const TaskCard = ({ task, onUpdateStatus }: TaskCardProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-semibold">{task.title}</h4>
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              <Badge className={getStatusColor(task.status)}>
                {getStatusIcon(task.status)}
                {task.status}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {task.employeeName}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </div>
              <div>
                Est: {task.estimatedHours}h
              </div>
              <div>
                Category: {task.category}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {task.status === 'pending' && (
              <Button size="sm" onClick={() => onUpdateStatus(task.id, 'in-progress')}>
                Start
              </Button>
            )}
            {task.status === 'in-progress' && (
              <Button size="sm" onClick={() => onUpdateStatus(task.id, 'completed')}>
                Complete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
