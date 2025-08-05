
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Calendar, DollarSign, Users, GripVertical } from "lucide-react";
import { Project } from '@/types/project';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: Project;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};

const ProjectCard = ({ project }: ProjectCardProps) => {
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
  const budgetUsed = Math.round((project.spent / project.budget) * 100);

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 ${
        isDragging ? 'shadow-lg' : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{project.name}</h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {project.description}
            </p>
          </div>
          <div 
            {...listeners}
            className="ml-2 p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Badge className={priorityColors[project.priority]} variant="secondary">
            {project.priority}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {project.type}
          </Badge>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(project.dueDate, 'MMM dd')}
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            ${project.budget.toLocaleString()}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{project.team.length}</span>
          </div>
          
          <div className="flex -space-x-2">
            {project.team.slice(0, 3).map((member) => (
              <Avatar key={member.id} className="h-6 w-6 border-2 border-white">
                <AvatarFallback className="text-xs">
                  {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.team.length > 3 && (
              <div className="h-6 w-6 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-xs font-medium">+{project.team.length - 3}</span>
              </div>
            )}
          </div>
        </div>

        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {project.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                {tag}
              </Badge>
            ))}
            {project.tags.length > 2 && (
              <Badge variant="outline" className="text-xs px-2 py-0">
                +{project.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
