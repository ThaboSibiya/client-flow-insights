import React, { memo, useMemo, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Clock, Mail, Phone, GripVertical, MoreHorizontal,
  Eye, Edit2, Trash2, ArrowRight, MessageSquare, UserCheck
} from "lucide-react";
import { format, formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Customer, CustomerTicket } from '@/types/customer';

interface ModernPipelineCardProps {
  item: Customer | CustomerTicket;
  type: 'customer' | 'ticket';
  stageId: string;
  stages: { id: string; name: string }[];
  onMove: (itemId: string, fromStageId: string, toStageId: string) => void;
  onView?: (item: Customer | CustomerTicket) => void;
  onEdit?: (item: Customer | CustomerTicket) => void;
  onDelete?: (item: Customer | CustomerTicket) => void;
  onQuickAction?: (action: string, item: Customer | CustomerTicket) => void;
}

const ModernPipelineCard = ({ 
  item, 
  type, 
  stageId, 
  stages,
  onMove, 
  onView, 
  onEdit, 
  onDelete,
  onQuickAction 
}: ModernPipelineCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

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

  const style = useMemo(() => transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 1,
  } : undefined, [transform, isDragging]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-red-400 text-white';
      case 'medium': return 'bg-amber-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTimeAgo = (date: Date | string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const otherStages = stages.filter(s => s.id !== stageId);

  if (type === 'customer') {
    const customer = item as Customer;
    const isStale = customer.createdAt && 
      new Date().getTime() - new Date(customer.createdAt).getTime() > 7 * 24 * 60 * 60 * 1000;

    return (
      <TooltipProvider>
        <Card
          ref={setNodeRef}
          style={style}
          className={`group relative cursor-grab active:cursor-grabbing transition-all duration-200 border-border/50 hover:border-primary/30 ${
            isDragging ? 'shadow-xl scale-105 rotate-1 ring-2 ring-primary/20' : 'hover:shadow-md'
          } ${isStale ? 'border-l-4 border-l-amber-400' : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Drag handle */}
          <div 
            {...listeners}
            {...attributes}
            className={`absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab`}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Quick actions dropdown */}
          <div className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onView?.(customer)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(customer)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onQuickAction?.('email', customer)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onQuickAction?.('call', customer)}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {otherStages.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Move to</div>
                    {otherStages.map(stage => (
                      <DropdownMenuItem 
                        key={stage.id}
                        onClick={() => onMove(customer.id, stageId, stage.id)}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        {stage.name}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem 
                  onClick={() => onDelete?.(customer)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CardContent className="p-3 pt-2">
            <div className="flex items-center gap-3 mb-2 ml-5">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {customer.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{customer.name}</p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{customer.email}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs ml-5 mb-2">
              {customer.phone && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground cursor-pointer">
                      <Phone className="h-3 w-3" />
                      <span>{customer.phone}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>Click to call</TooltipContent>
                </Tooltip>
              )}
              <Badge variant="outline" className="text-xs">
                {customer.ticketCount || 0} tickets
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground ml-5">
              <span>{getTimeAgo(customer.createdAt)}</span>
              {isStale && (
                <Badge variant="outline" className="text-amber-600 border-amber-300 text-[10px]">
                  Stale
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>
    );
  }

  // Ticket card
  const ticket = item as CustomerTicket;
  return (
    <TooltipProvider>
      <Card
        ref={setNodeRef}
        style={style}
        className={`group relative cursor-grab active:cursor-grabbing transition-all duration-200 border-border/50 hover:border-primary/30 ${
          isDragging ? 'shadow-xl scale-105 rotate-1 ring-2 ring-primary/20' : 'hover:shadow-md'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Drag handle */}
        <div 
          {...listeners}
          {...attributes}
          className={`absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab`}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Quick actions */}
        <div className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onView?.(ticket)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(ticket)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onQuickAction?.('reply', ticket)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Reply
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onQuickAction?.('assign', ticket)}>
                <UserCheck className="h-4 w-4 mr-2" />
                Assign
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {otherStages.length > 0 && (
                <>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Move to</div>
                  {otherStages.map(stage => (
                    <DropdownMenuItem 
                      key={stage.id}
                      onClick={() => onMove(ticket.id, stageId, stage.id)}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      {stage.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem 
                onClick={() => onDelete?.(ticket)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CardContent className="p-3 pt-2">
          <div className="flex items-start justify-between mb-2 ml-5">
            <div className="flex-1 min-w-0 pr-6">
              <p className="font-medium text-sm truncate">{ticket.subject}</p>
              <p className="text-xs text-muted-foreground">
                #{ticket.ticketNumber}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-2 ml-5 flex-wrap">
            <Badge className={`text-xs ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority}
            </Badge>
            {ticket.assignedTo && (
              <Badge variant="secondary" className="text-xs">
                {ticket.assignedTo.name}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground ml-5">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{Math.round(ticket.totalTimeSpent / 60)}h</span>
            </div>
            <span>{getTimeAgo(ticket.createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default memo(ModernPipelineCard);
