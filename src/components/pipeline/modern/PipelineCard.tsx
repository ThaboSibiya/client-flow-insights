import React, { memo, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Clock, Mail, Phone, GripVertical, MoreHorizontal,
  Eye, ArrowRight
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Customer, CustomerTicket } from '@/types/customer';
import { PipelineType, PipelineStage } from '@/hooks/usePipeline';

interface PipelineCardProps {
  item: Customer | CustomerTicket;
  type: PipelineType;
  stageId: string;
  stages: PipelineStage[];
  onMove: (itemId: string, fromStageId: string, toStageId: string) => void;
  onSelect: (item: Customer | CustomerTicket) => void;
  isSelected: boolean;
}

const PipelineCard = memo(({ 
  item, type, stageId, stages, onMove, onSelect, isSelected,
}: PipelineCardProps) => {
  const {
    attributes, listeners, setNodeRef, transform, isDragging,
  } = useDraggable({
    id: `${type}-${item.id}`,
    data: { item, type, stageId },
  });

  const style = useMemo(() => transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 1000 : 1,
  } : undefined, [transform, isDragging]);

  const getTimeAgo = (date: Date | string | undefined) => {
    if (!date) return '';
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return '';
    }
  };

  const getInitials = (name: string | undefined): string => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0] || '').join('').toUpperCase().slice(0, 2) || '??';
  };

  const otherStages = stages.filter(s => s.id !== stageId);

  if (type === 'customer') {
    const customer = item as Customer;

    return (
      <Card
        ref={setNodeRef}
        style={style}
        onClick={() => onSelect(customer)}
        className={`group relative cursor-pointer transition-all duration-150 border-border/50 hover:border-primary/30 ${
          isDragging ? 'shadow-xl scale-105 ring-2 ring-primary/20' : 'hover:shadow-sm'
        } ${isSelected ? 'ring-2 ring-primary border-primary' : ''}`}
      >
        {/* Drag handle */}
        <div 
          {...listeners} {...attributes}
          className="absolute top-2 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </div>

        {/* Quick actions */}
        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onSelect(customer)}>
                <Eye className="h-3.5 w-3.5 mr-2" />
                View Details
              </DropdownMenuItem>
              {otherStages.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Move to</div>
                  {otherStages.map(stage => (
                    <DropdownMenuItem 
                      key={stage.id}
                      onClick={() => onMove(customer.id, stageId, stage.id)}
                    >
                      <ArrowRight className="h-3.5 w-3.5 mr-2" />
                      {stage.name}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <CardContent className="p-2.5 pl-6">
          <div className="flex items-center gap-2.5 mb-1">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {getInitials(customer?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-xs truncate">{customer?.name || 'Unknown'}</p>
              <p className="text-[11px] text-muted-foreground truncate">{customer?.email || 'No email'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pl-9">
            <span>{getTimeAgo(customer?.createdAt)}</span>
            {customer?.phone && (
              <div className="flex items-center gap-0.5">
                <Phone className="h-2.5 w-2.5" />
                <span className="truncate max-w-[80px]">{customer.phone}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ticket card
  const ticket = item as CustomerTicket;
  const priorityColors: Record<string, string> = {
    urgent: 'bg-destructive text-destructive-foreground',
    high: 'bg-destructive/80 text-destructive-foreground',
    medium: 'bg-amber-500 text-white',
    low: 'bg-green-500 text-white',
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(ticket)}
      className={`group relative cursor-pointer transition-all duration-150 border-border/50 hover:border-primary/30 ${
        isDragging ? 'shadow-xl scale-105 ring-2 ring-primary/20' : 'hover:shadow-sm'
      } ${isSelected ? 'ring-2 ring-primary border-primary' : ''}`}
    >
      <div 
        {...listeners} {...attributes}
        className="absolute top-2 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      </div>

      <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onSelect(ticket)}>
              <Eye className="h-3.5 w-3.5 mr-2" />
              View Details
            </DropdownMenuItem>
            {otherStages.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Move to</div>
                {otherStages.map(stage => (
                  <DropdownMenuItem 
                    key={stage.id}
                    onClick={() => onMove(ticket.id, stageId, stage.id)}
                  >
                    <ArrowRight className="h-3.5 w-3.5 mr-2" />
                    {stage.name}
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CardContent className="p-2.5 pl-6">
        <div className="mb-1">
          <p className="font-medium text-xs truncate pr-6">{ticket?.subject || 'No Subject'}</p>
          <p className="text-[11px] text-muted-foreground">#{ticket?.ticketNumber}</p>
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          <Badge className={`text-[10px] h-4 px-1.5 ${priorityColors[ticket?.priority || 'medium'] || ''}`}>
            {ticket?.priority}
          </Badge>
          {ticket?.assignedTo && (
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 truncate max-w-[100px]">
              {ticket.assignedTo.name}
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5" />
            <span>{Math.round((ticket?.totalTimeSpent || 0) / 60)}h</span>
          </div>
          <span>{getTimeAgo(ticket?.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
});

PipelineCard.displayName = 'PipelineCard';

export default PipelineCard;
