import React, { memo, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  MoreHorizontal, Plus, Zap, TrendingUp, ChevronDown, ChevronUp
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import PipelineCard from './PipelineCard';
import { Customer, CustomerTicket } from '@/types/customer';
import { PipelineType, PipelineStage } from '@/hooks/usePipeline';

interface PipelineStageColumnProps {
  stage: PipelineStage;
  type: PipelineType;
  allStages: PipelineStage[];
  selectedItem: Customer | CustomerTicket | null;
  onItemSelect: (item: Customer | CustomerTicket) => void;
  onItemMove: (itemId: string, fromStageId: string, toStageId: string) => void;
  onStageEdit: (stageId: string) => void;
  onStageDelete: (stageId: string) => void;
  onAddItem: (stageId: string) => void;
  onSetTarget: (stageId: string) => void;
  onSetAutomation: (stageId: string) => void;
}

const PipelineStageColumn = memo(({
  stage,
  type,
  allStages,
  selectedItem,
  onItemSelect,
  onItemMove,
  onStageEdit,
  onStageDelete,
  onAddItem,
  onSetTarget,
  onSetAutomation,
}: PipelineStageColumnProps) => {
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);
  
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const itemCount = stage.items.length;
  const progressPercentage = stage.target ? Math.min((itemCount / stage.target) * 100, 100) : null;

  return (
    <div
      ref={setNodeRef}
      className={`min-w-[300px] max-w-[320px] flex-shrink-0 transition-colors ${
        isOver ? 'bg-primary/5 rounded-lg' : ''
      }`}
    >
      <Card className="h-[calc(100vh-280px)] min-h-[500px] flex flex-col border-border/50 hover:shadow-md transition-shadow">
        <CardHeader 
          className="pb-3 space-y-0"
          style={{ borderTop: `3px solid ${stage.color}` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">{stage.name}</CardTitle>
              {stage.automationEnabled && (
                <Zap className="h-3.5 w-3.5 text-amber-500" />
              )}
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs">
                {itemCount}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onStageEdit(stage.id)}>
                    Edit Stage
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSetTarget(stage.id)}>
                    Set Target
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onSetAutomation(stage.id)}>
                    Configure Automation
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onStageDelete(stage.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    Delete Stage
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Collapsible metrics */}
          <Collapsible open={isMetricsOpen} onOpenChange={setIsMetricsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between h-7 text-xs text-muted-foreground hover:text-foreground">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {stage.target ? `${itemCount}/${stage.target} target` : 'No target set'}
                </span>
                {isMetricsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              {progressPercentage !== null && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-1.5" />
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Automation</span>
                <Badge variant={stage.automationEnabled ? 'default' : 'outline'} className="text-[10px]">
                  {stage.automationEnabled ? 'Active' : 'Off'}
                </Badge>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-2 p-3 pt-0">
          {/* Quick add button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full border-dashed text-muted-foreground hover:text-foreground"
            onClick={() => onAddItem(stage.id)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add {type === 'customer' ? 'Customer' : 'Ticket'}
          </Button>

          {/* Items */}
          {stage.items.map((item) => (
            <PipelineCard
              key={item.id}
              item={item}
              type={type}
              stageId={stage.id}
              stages={allStages}
              onMove={onItemMove}
              onSelect={onItemSelect}
              isSelected={selectedItem?.id === item.id}
            />
          ))}

          {stage.items.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-sm">No {type}s in this stage</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

PipelineStageColumn.displayName = 'PipelineStageColumn';

export default PipelineStageColumn;
