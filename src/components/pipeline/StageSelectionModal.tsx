
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight } from "lucide-react";

interface StageSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStageId: string;
  stages: any[];
  itemName: string;
  onMoveToStage: (stageId: string) => void;
}

const StageSelectionModal = ({
  open,
  onOpenChange,
  currentStageId,
  stages,
  itemName,
  onMoveToStage
}: StageSelectionModalProps) => {
  const currentStage = stages.find(s => s.id === currentStageId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Move to Stage</DialogTitle>
          <p className="text-sm text-quikle-slate">
            Move "{itemName}" to a different stage
          </p>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          {/* Current stage indicator */}
          <div className="flex items-center gap-3 p-3 bg-quikle-crystal/50 rounded-lg border border-quikle-primary/20">
            <CheckCircle className="h-4 w-4 text-quikle-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium text-quikle-charcoal">Current Stage</p>
              <div className="flex items-center gap-2 mt-1">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: currentStage?.color }}
                />
                <span className="text-sm text-quikle-slate">{currentStage?.name}</span>
              </div>
            </div>
          </div>

          {/* Available stages */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-quikle-charcoal">Available Stages</p>
            {stages
              .filter(stage => stage.id !== currentStageId)
              .map((stage) => (
                <Button
                  key={stage.id}
                  variant="outline"
                  className="w-full justify-start h-auto p-3 hover:bg-quikle-crystal/30"
                  onClick={() => onMoveToStage(stage.id)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: stage.color }}
                    />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{stage.name}</p>
                      <div className="flex items-center gap-2 text-xs text-quikle-slate">
                        <span>
                          {(stage.customers?.length || stage.tickets?.length || 0)} items
                        </span>
                        {stage.target && (
                          <Badge variant="outline" className="text-xs">
                            Target: {stage.target}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-quikle-slate" />
                  </div>
                </Button>
              ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StageSelectionModal;
