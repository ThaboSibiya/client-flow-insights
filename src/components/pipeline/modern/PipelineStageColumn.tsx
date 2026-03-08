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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const itemCount = stage.items.length;
  const progressPercentage = stage.target ? Math.min((itemCount / stage.target) * 100, 100) : null;

  return (
    <>
      <div
        ref={setNodeRef}
        className={`min-w-[280px] max-w-[300px] flex-shrink-0 transition-all duration-200 ${
          isOver ? 'scale-[1.01]' : ''
        }`}
      >
        <Card className={`h-[calc(100vh-220px)] min-h-[400px] flex flex-col border-border/50 transition-shadow ${
          isOver ? 'shadow-lg ring-2 ring-primary/20' : 'hover:shadow-md'
        }`}>
          <CardHeader 
            className="pb-2 space-y-0 px-3 pt-3"
            style={{ borderTop: `3px solid ${stage.color}` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <CardTitle className="text-sm font-semibold truncate">{stage.name}</CardTitle>
                {stage.automationEnabled && (
                  <Zap className="h-3 w-3 text-amber-500 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs tabular-nums">
                  {itemCount}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreHorizontal className="h-3.5 w-3.5" />
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setIsDeleteOpen(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      Delete Stage
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Collapsible metrics */}
            {stage.target && (
              <Collapsible open={isMetricsOpen} onOpenChange={setIsMetricsOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between h-6 text-xs text-muted-foreground hover:text-foreground px-0">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {itemCount}/{stage.target} target
                    </span>
                    {isMetricsOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-1.5 space-y-1.5">
                  {progressPercentage !== null && (
                    <div className="space-y-0.5">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{Math.round(progressPercentage)}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-1" />
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Automation</span>
                    <Badge variant={stage.automationEnabled ? 'default' : 'outline'} className="text-[10px] h-4">
                      {stage.automationEnabled ? 'Active' : 'Off'}
                    </Badge>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto space-y-1.5 p-2 pt-0">
            {/* Quick add */}
            <Button
              variant="outline"
              size="sm"
              className="w-full border-dashed text-muted-foreground hover:text-foreground h-8 text-xs"
              onClick={() => onAddItem(stage.id)}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
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
              <div className="text-center text-muted-foreground py-6">
                <p className="text-xs">No {type}s yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{stage.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this stage and all {itemCount} {type}s in it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onStageDelete(stage.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Stage
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

PipelineStageColumn.displayName = 'PipelineStageColumn';

export default PipelineStageColumn;
