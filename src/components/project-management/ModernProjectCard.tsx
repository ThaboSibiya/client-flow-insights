import React, { memo, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  DollarSign, 
  Users, 
  GripVertical,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { Project } from '@/types/project';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ModernProjectCardProps {
  project: Project;
  onView?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

const priorityConfig = {
  low: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', dot: 'bg-emerald-500' },
  medium: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', dot: 'bg-amber-500' },
  high: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', dot: 'bg-orange-500' },
  urgent: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', dot: 'bg-red-500' },
};

const statusConfig = {
  'not-started': { color: 'text-muted-foreground', bg: 'bg-muted' },
  'in-progress': { color: 'text-primary', bg: 'bg-primary/10' },
  'on-hold': { color: 'text-amber-600', bg: 'bg-amber-100' },
  'completed': { color: 'text-emerald-600', bg: 'bg-emerald-100' },
  'cancelled': { color: 'text-destructive', bg: 'bg-destructive/10' },
};

const ModernProjectCard = memo(({ project, onView, onEdit, onDelete }: ModernProjectCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const progressPercentage = Math.round(project.progress);
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
    <TooltipProvider>
      <Card
        ref={setNodeRef}
        style={style}
        className={`group transition-all duration-200 border-border/50 ${
          isDragging 
            ? 'shadow-xl ring-2 ring-primary/30 bg-background z-50' 
            : 'hover:shadow-md hover:border-primary/20'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-4">
          {/* Header: Name + Actions */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${priorityConfig[project.priority].dot}`} />
                <h3 className="font-medium text-sm truncate text-foreground">
                  {project.name}
                </h3>
              </div>
            </div>
            
            <div className="flex items-center gap-1 shrink-0">
              {/* Drag Handle */}
              <div 
                {...listeners}
                {...attributes}
                className={`p-1 rounded cursor-grab active:cursor-grabbing touch-none transition-opacity ${
                  isHovered ? 'opacity-100' : 'opacity-0'
                } hover:bg-muted`}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              
              {/* Quick Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-7 w-7 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => onView?.(project)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit?.(project)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(project)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Progress Bar - Always visible */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-1.5" />
          </div>

          {/* Status + Due Date - Always visible */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <Badge 
              variant="secondary" 
              className={`text-xs font-normal ${statusConfig[project.status]?.bg} ${statusConfig[project.status]?.color}`}
            >
              {project.status.replace('-', ' ')}
            </Badge>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(project.dueDate), 'MMM d')}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Due: {format(new Date(project.dueDate), 'MMMM d, yyyy')}</p>
                {isOverdue && <p className="text-destructive">Overdue</p>}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Expanded Details - Show on hover */}
          <div className={`space-y-2 overflow-hidden transition-all duration-200 ${
            isHovered ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                <span>{formatCurrency(project.budget)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{project.team.length} members</span>
              </div>
            </div>
            
            {project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {project.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                    {tag}
                  </Badge>
                ))}
                {project.tags.length > 3 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                    +{project.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Team Avatars - Always visible */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex -space-x-1.5">
              {project.team.slice(0, 3).map((member) => (
                <Tooltip key={member.id}>
                  <TooltipTrigger asChild>
                    <Avatar className="h-6 w-6 border-2 border-background">
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>{member.name}</TooltipContent>
                </Tooltip>
              ))}
              {project.team.length > 3 && (
                <div className="h-6 w-6 bg-muted rounded-full border-2 border-background flex items-center justify-center">
                  <span className="text-[10px] font-medium text-muted-foreground">
                    +{project.team.length - 3}
                  </span>
                </div>
              )}
            </div>
            
            <Badge variant="secondary" className={`text-[10px] ${priorityConfig[project.priority].color}`}>
              {project.priority}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
});

ModernProjectCard.displayName = 'ModernProjectCard';

export default ModernProjectCard;
