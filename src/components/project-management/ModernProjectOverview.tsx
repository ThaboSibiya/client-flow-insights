import React, { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Project } from '@/types/project';
import { Calendar, DollarSign, Users, ArrowRight, Clock } from 'lucide-react';
import { format } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ModernProjectOverviewProps {
  projects: Project[];
  onProjectSelect?: (project: Project) => void;
}

const priorityConfig = {
  low: { color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  medium: { color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  high: { color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  urgent: { color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

const statusConfig = {
  'not-started': { label: 'Not Started', color: 'text-muted-foreground bg-muted' },
  'in-progress': { label: 'In Progress', color: 'text-primary bg-primary/10' },
  'on-hold': { label: 'On Hold', color: 'text-amber-600 bg-amber-100' },
  'completed': { label: 'Completed', color: 'text-emerald-600 bg-emerald-100' },
  'cancelled': { label: 'Cancelled', color: 'text-destructive bg-destructive/10' },
};

const ProjectGridCard = memo(({ project, onSelect }: { project: Project; onSelect?: (p: Project) => void }) => {
  const isOverdue = new Date(project.dueDate) < new Date() && project.status !== 'completed';
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/20 cursor-pointer"
      onClick={() => onSelect?.(project)}
    >
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${priorityConfig[project.priority].dot}`} />
              <h3 className="font-semibold text-foreground truncate">{project.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          </div>
          <Badge className={`ml-2 shrink-0 text-xs ${statusConfig[project.status].color}`}>
            {statusConfig[project.status].label}
          </Badge>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>

        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`flex items-center gap-2 ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(project.dueDate), 'MMM d, yyyy')}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {isOverdue ? 'Overdue' : 'Due date'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>{formatCurrency(project.budget)}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{project.team.length} members</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{project.tasks.length} tasks</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          {/* Team Avatars */}
          <div className="flex -space-x-2">
            {project.team.slice(0, 4).map((member) => (
              <TooltipProvider key={member.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="h-7 w-7 border-2 border-background">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>{member.name}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            {project.team.length > 4 && (
              <div className="h-7 w-7 bg-muted rounded-full border-2 border-background flex items-center justify-center">
                <span className="text-xs font-medium text-muted-foreground">
                  +{project.team.length - 4}
                </span>
              </div>
            )}
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            View Details
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {project.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-2 py-0 h-5">
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0 h-5">
                +{project.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

ProjectGridCard.displayName = 'ProjectGridCard';

const ModernProjectOverview = memo(({ projects, onProjectSelect }: ModernProjectOverviewProps) => {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Calendar className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No projects found</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Create your first project to get started with project management.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectGridCard 
          key={project.id} 
          project={project} 
          onSelect={onProjectSelect}
        />
      ))}
    </div>
  );
});

ModernProjectOverview.displayName = 'ModernProjectOverview';

export default ModernProjectOverview;
