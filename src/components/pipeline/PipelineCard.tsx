
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Mail, Phone, GripVertical } from "lucide-react";
import { format } from 'date-fns';

interface PipelineCardProps {
  item: any;
  type: 'customer' | 'ticket';
  stageId: string;
  onMove: (itemId: string, fromStageId: string, toStageId: string) => void;
}

const PipelineCard = ({ item, type, stageId, onMove }: PipelineCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `${type}-${item.id}`,
    data: {
      item,
      type,
      stageId,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 1,
  } : undefined;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (type === 'customer') {
    return (
      <Card
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 group ${
          isDragging ? 'shadow-xl scale-105 rotate-2' : ''
        }`}
      >
        <CardContent className="p-3 relative">
          {/* Drag handle */}
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="flex items-center gap-3 mb-2 ml-6">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {item.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{item.name}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate">{item.email}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs ml-6">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{item.phone}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {item.ticketCount} tickets
            </Badge>
          </div>
          
          <div className="mt-2 text-xs text-muted-foreground ml-6">
            Added {format(new Date(item.createdAt), 'MMM dd')}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 group ${
        isDragging ? 'shadow-xl scale-105 rotate-2' : ''
      }`}
    >
      <CardContent className="p-3 relative">
        {/* Drag handle */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex items-start justify-between mb-2 ml-6">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{item.subject}</p>
            <p className="text-xs text-muted-foreground truncate">
              #{item.ticketNumber}
            </p>
          </div>
          <div className={`w-2 h-2 rounded-full ${getPriorityColor(item.priority)}`} />
        </div>
        
        <div className="flex items-center gap-2 mb-2 ml-6">
          <Badge variant="outline" className="text-xs">
            {item.priority}
          </Badge>
          {item.assignedTo && (
            <Badge variant="secondary" className="text-xs">
              {item.assignedTo.name}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground ml-6">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{Math.round(item.totalTimeSpent / 60)}h</span>
          </div>
          <span>{format(new Date(item.createdAt), 'MMM dd')}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PipelineCard;
