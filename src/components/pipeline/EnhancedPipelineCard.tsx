
import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, Mail, Phone, AlertCircle, Edit, Trash2, Eye, GripVertical } from "lucide-react";
import { format } from 'date-fns';

interface EnhancedPipelineCardProps {
  item: any;
  type: 'customer' | 'ticket';
  stageId: string;
  onMove: (itemId: string, fromStageId: string, toStageId: string) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onView?: (item: any) => void;
}

const EnhancedPipelineCard = ({ 
  item, 
  type, 
  stageId, 
  onMove, 
  onEdit, 
  onDelete, 
  onView 
}: EnhancedPipelineCardProps) => {
  const [showActions, setShowActions] = useState(false);

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
      case 'high': return 'bg-red-400';
      case 'medium': return 'bg-quikle-accent';
      case 'low': return 'bg-quikle-success';
      default: return 'bg-quikle-neutral';
    }
  };

  if (type === 'customer') {
    return (
      <Card
        ref={setNodeRef}
        style={style}
        className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 group border-quikle-silver/30 ${
          isDragging ? 'shadow-xl scale-105 rotate-2' : ''
        }`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        {...listeners}
        {...attributes}
      >
        <CardContent className="p-3 relative">
          {/* Drag handle */}
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-4 w-4 text-quikle-slate" />
          </div>

          {/* Quick actions overlay */}
          <div className={`absolute top-2 right-2 flex gap-1 transition-opacity duration-200 ${
            showActions ? 'opacity-100' : 'opacity-0'
          }`}>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-quikle-slate hover:text-quikle-primary hover:bg-quikle-crystal"
              onClick={(e) => {
                e.stopPropagation();
                onView?.(item);
              }}
            >
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 text-quikle-slate hover:text-quikle-primary hover:bg-quikle-crystal"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(item);
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-2 ml-6">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-quikle-crystal text-quikle-primary">
                {item.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate text-quikle-charcoal">{item.name}</p>
              <div className="flex items-center gap-2 text-xs text-quikle-slate">
                <Mail className="h-3 w-3" />
                <span className="truncate">{item.email}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs mb-2 ml-6">
            <div className="flex items-center gap-1 text-quikle-slate">
              <Phone className="h-3 w-3" />
              <span>{item.phone}</span>
            </div>
            <Badge variant="outline" className="text-xs border-quikle-silver/50 text-quikle-slate">
              {item.ticketCount || 0} tickets
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-xs text-quikle-slate ml-6">
            <span>Added {format(new Date(item.createdAt), 'MMM dd')}</span>
            {item.lastContact && (
              <span>Last contact: {format(new Date(item.lastContact), 'MMM dd')}</span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 group border-quikle-silver/30 ${
        isDragging ? 'shadow-xl scale-105 rotate-2' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      {...listeners}
      {...attributes}
    >
      <CardContent className="p-3 relative">
        {/* Drag handle */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-4 w-4 text-quikle-slate" />
        </div>

        {/* Quick actions overlay */}
        <div className={`absolute top-2 right-2 flex gap-1 transition-opacity duration-200 ${
          showActions ? 'opacity-100' : 'opacity-0'
        }`}>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-quikle-slate hover:text-quikle-primary hover:bg-quikle-crystal"
            onClick={(e) => {
              e.stopPropagation();
              onView?.(item);
            }}
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-quikle-slate hover:text-quikle-primary hover:bg-quikle-crystal"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(item);
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex items-start justify-between mb-2 ml-6">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate text-quikle-charcoal">{item.subject}</p>
            <p className="text-xs text-quikle-slate truncate">
              #{item.ticketNumber}
            </p>
          </div>
          <div className={`w-2 h-2 rounded-full ${getPriorityColor(item.priority)}`} />
        </div>
        
        <div className="flex items-center gap-2 mb-2 ml-6">
          <Badge variant="outline" className="text-xs border-quikle-silver/50 text-quikle-slate">
            {item.priority}
          </Badge>
          {item.assignedTo && (
            <Badge variant="secondary" className="text-xs bg-quikle-crystal text-quikle-primary">
              {item.assignedTo.name}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs text-quikle-slate ml-6">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{Math.round((item.totalTimeSpent || 0) / 60)}h</span>
          </div>
          <span>{format(new Date(item.createdAt), 'MMM dd')}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedPipelineCard;
