import React, { useState, useMemo, memo, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MoreHorizontal, User, Ticket, Zap, Search, Plus, 
  TrendingUp, ChevronDown, ChevronUp, GripVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import ModernPipelineCard from './ModernPipelineCard';
import EditStageDialog from './dialogs/EditStageDialog';
import SetTargetDialog from './dialogs/SetTargetDialog';
import SetAutomationDialog from './dialogs/SetAutomationDialog';
import { Customer, CustomerTicket } from '@/types/customer';

interface EnhancedPipelineStageProps {
  stage: {
    id: string;
    name: string;
    color: string;
    customers?: Customer[];
    tickets?: CustomerTicket[];
    automationEnabled: boolean;
    target?: number;
  };
  onCustomerMove: (itemId: string, fromStageId: string, toStageId: string) => void;
  onStageEdit?: (stageId: string, name: string, color: string) => void;
  onStageDelete?: (stageId: string) => void;
  onAddItem?: (stageId: string) => void;
  onSetTarget?: (stageId: string, target: number | undefined) => void;
  onSetAutomation?: (stageId: string, enabled: boolean) => void;
  type: 'customer' | 'ticket';
}

const EnhancedPipelineStage = memo(({ 
  stage, 
  onCustomerMove, 
  onStageEdit, 
  onStageDelete,
  onAddItem,
  onSetTarget,
  onSetAutomation,
  type 
}: EnhancedPipelineStageProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [targetDialogOpen, setTargetDialogOpen] = useState(false);
  const [automationDialogOpen, setAutomationDialogOpen] = useState(false);

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
  
  // Create stages array for the card's move menu
  const allStages = useMemo(() => [
    { id: stage.id, name: stage.name }
  ], [stage.id, stage.name]);
  
  // Filter items based on search term - memoized
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    return items.filter(item => {
      if (type === 'customer') {
        const customer = item as Customer;
        return `${customer.name} ${customer.email}`.toLowerCase().includes(searchTerm.toLowerCase());
      } else {
        const ticket = item as CustomerTicket;
        return `${ticket.subject} ${ticket.ticketNumber}`.toLowerCase().includes(searchTerm.toLowerCase());
      }
    });
  }, [items, searchTerm, type]);

  // Calculate progress if target is set - memoized
  const progressPercentage = useMemo(() => 
    stage.target ? Math.min((itemCount / stage.target) * 100, 100) : null,
    [stage.target, itemCount]
  );

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
        isHovered ? 'shadow-lg ring-2 ring-quikle-primary/20' : 'shadow-md'
      } ${isDragging ? 'rotate-2 scale-105' : ''}`}>
        <CardHeader 
          className="pb-3 relative"
          style={{ borderTop: `4px solid ${stage.color}` }}
        >
          {/* Drag handle - separate from dropdown */}
          <div 
            {...listeners}
            className={`absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-quikle-silver rounded-full transition-opacity cursor-grab active:cursor-grabbing ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`} 
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg text-quikle-charcoal">{stage.name}</CardTitle>
              {stage.automationEnabled && (
                <Zap className="h-4 w-4 text-quikle-accent" />
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-quikle-slate hover:text-quikle-primary"
                  onClick={(e) => {
                    console.log('Dropdown trigger clicked');
                    e.stopPropagation();
                  }}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-quikle-silver/30 z-[9999]">
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Edit dialog opening for stage:', stage.id);
                    setEditDialogOpen(true);
                  }} 
                  className="text-quikle-charcoal hover:bg-quikle-crystal cursor-pointer"
                >
                  Edit Stage
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Target dialog opening for stage:', stage.id);
                    setTargetDialogOpen(true);
                  }} 
                  className="text-quikle-charcoal hover:bg-quikle-crystal cursor-pointer"
                >
                  Set Target
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Automation dialog opening for stage:', stage.id);
                    setAutomationDialogOpen(true);
                  }} 
                  className="text-quikle-charcoal hover:bg-quikle-crystal cursor-pointer"
                >
                  Set Automation
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-red-600 hover:bg-red-50 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Delete stage called:', stage.id);
                    onStageDelete?.(stage.id);
                  }}
                >
                  Delete Stage
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1 bg-quikle-crystal text-quikle-primary border-quikle-silver/30">
                {type === 'customer' ? <User className="h-3 w-3" /> : <Ticket className="h-3 w-3" />}
                {itemCount} {type === 'customer' ? 'customers' : 'tickets'}
              </Badge>
              {stage.target && (
                <Badge variant="outline" className="flex items-center gap-1 border-quikle-primary/30 text-quikle-primary">
                  <TrendingUp className="h-3 w-3" />
                  Target: {stage.target}
                </Badge>
              )}
            </div>
            
            {/* Progress bar */}
            {progressPercentage !== null && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-quikle-slate">
                  <span>Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}
            
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-quikle-slate" />
              <Input
                placeholder={`Search ${type}s...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-sm border-quikle-silver/50 text-quikle-charcoal"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto space-y-2 p-3">
          {/* Quick add button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full border-dashed border-quikle-primary/30 text-quikle-primary hover:bg-quikle-crystal"
            onClick={() => onAddItem?.(stage.id)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add {type === 'customer' ? 'Customer' : 'Ticket'}
          </Button>
          
          {filteredItems.map((item) => (
            <ModernPipelineCard
              key={item.id}
              item={item}
              type={type}
              stageId={stage.id}
              stages={allStages}
              onMove={onCustomerMove}
            />
          ))}
          
          {filteredItems.length === 0 && searchTerm && (
            <div className="text-center text-quikle-slate py-4">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No {type}s found matching "{searchTerm}"</p>
            </div>
          )}
          
          {filteredItems.length === 0 && !searchTerm && (
            <div className="text-center text-quikle-slate py-8">
              <div className="text-4xl mb-2">📋</div>
              <p>No {type === 'customer' ? 'customers' : 'tickets'} in this stage</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <EditStageDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        stage={stage}
        onEditStage={(stageId, name, color) => {
          console.log('EditStage called:', stageId, name, color);
          onStageEdit?.(stageId, name, color);
        }}
      />
      
      <SetTargetDialog
        open={targetDialogOpen}
        onOpenChange={setTargetDialogOpen}
        stage={stage}
        onSetTarget={(stageId, target) => {
          console.log('SetTarget called:', stageId, target);
          onSetTarget?.(stageId, target);
        }}
      />
      
      <SetAutomationDialog
        open={automationDialogOpen}
        onOpenChange={setAutomationDialogOpen}
        stage={stage}
        onSetAutomation={(stageId, enabled) => {
          console.log('SetAutomation called:', stageId, enabled);
          onSetAutomation?.(stageId, enabled);
        }}
      />
    </div>
  );
});

EnhancedPipelineStage.displayName = 'EnhancedPipelineStage';

export default EnhancedPipelineStage;
