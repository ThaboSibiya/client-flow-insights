
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Project, ProjectStatus, ProjectType, Priority, TeamMember } from '@/types/project';
import { toast } from '@/hooks/use-toast';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  teamMembers: TeamMember[];
}

const NewProjectModal = ({ isOpen, onClose, onCreateProject, teamMembers }: NewProjectModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '' as ProjectType,
    priority: '' as Priority,
    budget: '',
    client: '',
    startDate: undefined as Date | undefined,
    dueDate: undefined as Date | undefined,
    ownerId: '',
    teamIds: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Project name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.type) {
      toast({
        title: "Validation Error", 
        description: "Project type is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.priority) {
      toast({
        title: "Validation Error",
        description: "Priority is required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.ownerId) {
      toast({
        title: "Validation Error",
        description: "Project owner is required.",
        variant: "destructive",
      });
      return;
    }

    const owner = teamMembers.find(member => member.id === formData.ownerId)!;
    const team = teamMembers.filter(member => 
      formData.teamIds.includes(member.id) || member.id === formData.ownerId
    );

    const projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name,
      description: formData.description,
      status: 'not-started' as ProjectStatus,
      type: formData.type,
      priority: formData.priority,
      startDate: formData.startDate || new Date(),
      dueDate: formData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      budget: parseFloat(formData.budget) || 0,
      spent: 0,
      progress: 0,
      owner,
      team,
      tasks: [],
      tags: [],
      client: formData.client || 'Internal',
    };

    onCreateProject(projectData);
    handleReset();
    onClose();
    
    toast({
      title: "Project Created",
      description: `${formData.name} has been created successfully.`,
    });
  };

  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      type: '' as ProjectType,
      priority: '' as Priority,
      budget: '',
      client: '',
      startDate: undefined,
      dueDate: undefined,
      ownerId: '',
      teamIds: [],
    });
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new project for your team.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter project name..."
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the project..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="type">Project Type *</Label>
              <Select value={formData.type} onValueChange={(value: ProjectType) => 
                setFormData(prev => ({ ...prev, type: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority *</Label>
              <Select value={formData.priority} onValueChange={(value: Priority) => 
                setFormData(prev => ({ ...prev, priority: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="budget">Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="client">Client</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                placeholder="Client name or 'Internal'..."
              />
            </div>

            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? format(formData.dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="owner">Project Owner *</Label>
              <Select value={formData.ownerId} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, ownerId: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select owner..." />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name} - {member.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-quikle-primary hover:bg-quikle-secondary text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewProjectModal;
