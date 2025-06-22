
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, User, AlertCircle, CheckCircle, Target } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  employeeName: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  dueDate: string;
  estimatedHours: number;
  category: string;
}

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
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium' as const,
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Daily Task Assignment</h3>
          <p className="text-sm text-muted-foreground">Assign and manage daily tasks by priority</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Assign New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Task Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Task Title</Label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title..."
                />
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Task description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Assign to Employee</Label>
                  <Select value={newTask.assignedTo} onValueChange={(value) => setNewTask(prev => ({ ...prev, assignedTo: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emp-001">John Smith</SelectItem>
                      <SelectItem value="emp-002">Sarah Johnson</SelectItem>
                      <SelectItem value="emp-003">Mike Wilson</SelectItem>
                      <SelectItem value="emp-004">Lisa Brown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Priority</Label>
                  <Select value={newTask.priority} onValueChange={(value: any) => setNewTask(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Estimated Hours</Label>
                  <Input
                    type="number"
                    min="1"
                    max="24"
                    value={newTask.estimatedHours}
                    onChange={(e) => setNewTask(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <Select value={newTask.category} onValueChange={(value) => setNewTask(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Field Work">Field Work</SelectItem>
                      <SelectItem value="Administration">Administration</SelectItem>
                      <SelectItem value="Customer Service">Customer Service</SelectItem>
                      <SelectItem value="Technical">Technical</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createTask}>
                  Create Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id}>
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
                    <Button size="sm" onClick={() => updateTaskStatus(task.id, 'in-progress')}>
                      Start
                    </Button>
                  )}
                  {task.status === 'in-progress' && (
                    <Button size="sm" onClick={() => updateTaskStatus(task.id, 'completed')}>
                      Complete
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
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
