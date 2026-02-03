import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CalendarIcon, 
  Loader2, 
  Sparkles,
  Briefcase,
  Target,
  DollarSign,
  User,
  Users
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Project, ProjectStatus, ProjectType, Priority, TeamMember, ProjectFormData } from '@/types/project';
import { toast } from '@/hooks/use-toast';
import { validateProject, sanitizeProjectInput } from '@/utils/project-validation';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  teamMembers: TeamMember[];
}

const projectTypes: { value: ProjectType; label: string; icon: string }[] = [
  { value: 'design', label: 'Design', icon: '🎨' },
  { value: 'development', label: 'Development', icon: '💻' },
  { value: 'marketing', label: 'Marketing', icon: '📢' },
  { value: 'research', label: 'Research', icon: '🔬' },
  { value: 'maintenance', label: 'Maintenance', icon: '🔧' },
];

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-emerald-500' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
];

const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onCreateProject, teamMembers }) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    type: '' as ProjectType,
    priority: '' as Priority,
    budget: 0,
    client: '',
    startDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    ownerId: '',
    teamIds: [],
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<'basic' | 'details' | 'team'>('basic');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const sanitizedData = {
        ...formData,
        name: sanitizeProjectInput(formData.name),
        description: sanitizeProjectInput(formData.description),
        client: sanitizeProjectInput(formData.client)
      };
      
      const validation = validateProject(sanitizedData);
      if (!validation.success) {
        toast({
          title: "Validation Error",
          description: validation.errors?.[0] || "Please check your inputs",
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

      const owner = teamMembers.find(member => member.id === formData.ownerId);
      if (!owner) {
        toast({
          title: "Validation Error",
          description: "Selected owner not found.",
          variant: "destructive",
        });
        return;
      }

      const team = teamMembers.filter(member => 
        formData.teamIds.includes(member.id) || member.id === formData.ownerId
      );

      const projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
        name: sanitizedData.name,
        description: sanitizedData.description,
        status: 'not-started' as ProjectStatus,
        type: formData.type,
        priority: formData.priority,
        startDate: formData.startDate,
        dueDate: formData.dueDate,
        budget: formData.budget,
        spent: 0,
        progress: 0,
        owner,
        team,
        tasks: [],
        tags: [],
        client: sanitizedData.client || 'Internal',
      };

      const success = await onCreateProject(projectData);
      
      if (success) {
        handleReset();
        onClose();
        
        toast({
          title: "Project Created",
          description: `${sanitizedData.name} has been created successfully.`,
        });
      } else {
        toast({
          title: "Creation Failed",
          description: "Failed to create project. Please check your inputs and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      type: '' as ProjectType,
      priority: '' as Priority,
      budget: 0,
      client: '',
      startDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ownerId: '',
      teamIds: [],
    });
    setIsSubmitting(false);
    setActiveSection('basic');
  }, []);

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const sections = [
    { id: 'basic', label: 'Basics', icon: Sparkles },
    { id: 'details', label: 'Details', icon: Briefcase },
    { id: 'team', label: 'Team', icon: Users },
  ] as const;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            Create New Project
          </DialogTitle>
        </DialogHeader>

        {/* Section Navigation */}
        <div className="px-6 py-3 border-b border-border/50 bg-muted/30">
          <div className="flex gap-1">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                  activeSection === section.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                <section.icon className="h-3.5 w-3.5" />
                {section.label}
              </button>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-6 py-5 space-y-5 max-h-[400px] overflow-y-auto">
            {/* Basic Section */}
            {activeSection === 'basic' && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Project Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter project name..."
                    className="h-10"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this project is about..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Type <span className="text-destructive">*</span>
                    </Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value: ProjectType) => setFormData(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <span className="flex items-center gap-2">
                              <span>{type.icon}</span>
                              {type.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Priority <span className="text-destructive">*</span>
                    </Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value: Priority) => setFormData(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <span className="flex items-center gap-2">
                              <span className={cn("h-2 w-2 rounded-full", priority.color)} />
                              {priority.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Details Section */}
            {activeSection === 'details' && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                      Budget
                    </Label>
                    <Input
                      type="number"
                      value={formData.budget || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) || 0 }))}
                      placeholder="0.00"
                      min="0"
                      step="100"
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-muted-foreground" />
                      Client
                    </Label>
                    <Input
                      value={formData.client}
                      onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                      placeholder="Client name"
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-10 justify-start text-left font-normal",
                            !formData.startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.startDate ? format(formData.startDate, "MMM d, yyyy") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.startDate}
                          onSelect={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-10 justify-start text-left font-normal",
                            !formData.dueDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dueDate ? format(formData.dueDate, "MMM d, yyyy") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.dueDate}
                          onSelect={(date) => setFormData(prev => ({ ...prev, dueDate: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            )}

            {/* Team Section */}
            {activeSection === 'team' && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Project Owner <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={formData.ownerId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, ownerId: value }))}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select project owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <span className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback className="text-[10px]">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span>{member.name}</span>
                            <span className="text-muted-foreground text-xs">• {member.role}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Team members preview */}
                {formData.ownerId && (
                  <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                    <p className="text-xs font-medium text-muted-foreground mb-3">PROJECT OWNER</p>
                    {(() => {
                      const owner = teamMembers.find(m => m.id === formData.ownerId);
                      if (!owner) return null;
                      return (
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                            <AvatarImage src={owner.avatar} />
                            <AvatarFallback>
                              {owner.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{owner.name}</p>
                            <p className="text-xs text-muted-foreground">{owner.role}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border/50 bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className={cn(
                "h-1.5 w-1.5 rounded-full",
                formData.name && formData.type && formData.priority ? "bg-emerald-500" : "bg-muted-foreground/30"
              )} />
              <span>
                {formData.name && formData.type && formData.priority 
                  ? "Ready to create" 
                  : "Fill required fields"}
              </span>
            </div>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={handleClose} 
                disabled={isSubmitting}
                size="sm"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !formData.name || !formData.type || !formData.priority || !formData.ownerId}
                size="sm"
                className="min-w-[100px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewProjectModal;
