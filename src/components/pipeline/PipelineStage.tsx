
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, User, Ticket, Clock, Zap } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PipelineCard from './PipelineCard';

interface PipelineStageProps {
  stage: {
    id: string;
    name: string;
    color: string;
    customers?: any[];
    tickets?: any[];
    automationEnabled: boolean;
  };
  onCustomerMove: (itemId: string, fromStageId: string, toStageId: string) => void;
  type: 'customer' | 'ticket';
}

const PipelineStage = ({ stage, onCustomerMove, type }: PipelineStageProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const items = type === 'customer' ? (stage.customers || []) : (stage.tickets || []);
  const itemCount = items.length;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="min-w-[300px] flex-shrink-0"
    >
      <Card className="h-[600px] flex flex-col">
        <CardHeader 
          {...listeners}
          className="cursor-grab active:cursor-grabbing pb-3"
          style={{ borderTop: `4px solid ${stage.color}` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{stage.name}</CardTitle>
              {stage.automationEnabled && (
                <Zap className="h-4 w-4 text-yellow-500" />
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Edit Stage</DropdownMenuItem>
                <DropdownMenuItem>Set Automation</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Delete Stage</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              {type === 'customer' ? <User className="h-3 w-3" /> : <Ticket className="h-3 w-3" />}
              {itemCount} {type === 'customer' ? 'customers' : 'tickets'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto space-y-2 p-3">
          {items.map((item) => (
            <PipelineCard
              key={item.id}
              item={item}
              type={type}
              stageId={stage.id}
              onMove={onCustomerMove}
            />
          ))}
          
          {itemCount === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <div className="text-4xl mb-2">📋</div>
              <p>No {type === 'customer' ? 'customers' : 'tickets'} in this stage</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PipelineStage;
