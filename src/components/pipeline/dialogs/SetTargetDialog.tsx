import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp } from "lucide-react";

interface SetTargetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: {
    id: string;
    name: string;
    target?: number;
  } | null;
  onSetTarget: (stageId: string, target: number | undefined) => void;
}

const SetTargetDialog = ({ open, onOpenChange, stage, onSetTarget }: SetTargetDialogProps) => {
  const [target, setTarget] = useState(stage?.target?.toString() || '');
  const [removeTarget, setRemoveTarget] = useState(false);

  React.useEffect(() => {
    if (stage) {
      setTarget(stage.target?.toString() || '');
      setRemoveTarget(false);
    }
  }, [stage]);

  const handleSave = () => {
    if (stage) {
      if (removeTarget) {
        onSetTarget(stage.id, undefined);
      } else {
        const targetNumber = parseInt(target);
        if (!isNaN(targetNumber) && targetNumber > 0) {
          onSetTarget(stage.id, targetNumber);
        }
      }
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-quikle-primary" />
            Set Target for "{stage?.name}"
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="target-value">Target Number</Label>
            <Input
              id="target-value"
              type="number"
              min="1"
              value={target}
              onChange={(e) => {
                setTarget(e.target.value);
                setRemoveTarget(false);
              }}
              placeholder="Enter target number"
              disabled={removeTarget}
            />
            <p className="text-sm text-quikle-slate">
              Set a target number to track progress for this stage
            </p>
          </div>
          
          {stage?.target && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remove-target"
                checked={removeTarget}
                onChange={(e) => {
                  setRemoveTarget(e.target.checked);
                  if (e.target.checked) setTarget('');
                }}
                className="rounded border-quikle-silver"
              />
              <Label htmlFor="remove-target" className="text-sm">
                Remove current target
              </Label>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!removeTarget && (!target || parseInt(target) <= 0)}
            className="bg-quikle-primary hover:bg-quikle-primary/90 text-white"
          >
            {removeTarget ? 'Remove Target' : 'Set Target'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SetTargetDialog;