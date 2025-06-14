
import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, User, Ticket, Clock, Zap, Search, Plus, TrendingUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import PipelineCard from './PipelineCard';

interface EnhancedPipelineStageProps {
  stage: {
    id: string;
    name: string;
    color: string;
    customers?: any[];
    tickets?: any[];
    automationEnabled: boolean;
    target?: number;
  };
  onCustomerMove: (itemId: string, fromStageId: string, toStageId: string) => void;
  onStageEdit?: (stageId: string) => void;
  onStageDelete?: (stageId: string) => void;
  onAddItem?: (stageId: string) => void;
  type: 'customer' | 'ticket';
}

const EnhancedPipelineStage = ({ 
  stage, 
  onCustomerMove, 
  onStageEdit, 
  onStageDelete,
  onAddItem,
  type 
}: EnhancedPipelineStageProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isHovered, setIsHovered] = useState(false);

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
  
  // Filter items based on search term
  const filteredItems = items.filter(item => {
    const searchableText = type === 'customer' 
      ? `${item.name} ${item.email}`.toLowerCase()
      : `${item.subject} ${item.ticketNumber}`.toLowerCase();
    return searchableText.includes(searchTerm.toLowerCase());
  });

  // Calculate progress if target is set
  const progressPercentage = stage.target ? Math.min((itemCount / stage.target) * 100, 100) : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="min-w-[320px] flex-shrink-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className={`h-[650px] flex flex-col transition-all duration-200 ${
        isHovered ? 'shadow-lg ring-2 ring-primary/20' : 'shadow-md'
      } ${isDragging ? 'rotate-2 scale-105' : ''}`}>
        <CardHeader 
          {...listeners}
          className="cursor-grab active:cursor-grabbing pb-3 relative"
          style={{ borderTop: `4px solid ${stage.color}` }}
        >
          {/* Drag indicator */}
          <div className={`absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-300 rounded-full transition-opacity ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`} />
          
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
                <DropdownMenuItem onClick={() => onStageEdit?.(stage.id)}>
                  Edit Stage
                </DropdownMenuItem>
                <DropdownMenuItem>Set Target</DropdownMenuItem>
                <DropdownMenuItem>Set Automation</DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => onStageDelete?.(stage.id)}
                >
                  Delete Stage
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                {type === 'customer' ? <User className="h-3 w-3" /> : <Ticket className="h-3 w-3" />}
                {itemCount} {type === 'customer' ? 'customers' : 'tickets'}
              </Badge>
              {stage.target && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Target: {stage.target}
                </Badge>
              )}
            </div>
            
            {/* Progress bar */}
            {progressPercentage !== null && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}
            
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${type}s...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto space-y-2 p-3">
          {/* Quick add button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full border-dashed"
            onClick={() => onAddItem?.(stage.id)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add {type === 'customer' ? 'Customer' : 'Ticket'}
          </Button>
          
          {filteredItems.map((item) => (
            <PipelineCard
              key={item.id}
              item={item}
              type={type}
              stageId={stage.id}
              onMove={onCustomerMove}
            />
          ))}
          
          {filteredItems.length === 0 && searchTerm && (
            <div className="text-center text-muted-foreground py-4">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No {type}s found matching "{searchTerm}"</p>
            </div>
          )}
          
          {filteredItems.length === 0 && !searchTerm && (
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

export default EnhancedPipelineStage;
