import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
            <TrendingUp className="h-5 w-5 text-primary" />
            Set Target for "{stage?.name}"
          </DialogTitle>
          <DialogDescription>
            Track progress by setting a target number for this stage.
          </DialogDescription>
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
          </div>
          
          {stage?.target && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remove-target"
                checked={removeTarget}
                onCheckedChange={(checked) => {
                  setRemoveTarget(!!checked);
                  if (checked) setTarget('');
                }}
              />
              <Label htmlFor="remove-target" className="text-sm">
                Remove current target
              </Label>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleSave}
            disabled={!removeTarget && (!target || parseInt(target) <= 0)}
          >
            {removeTarget ? 'Remove Target' : 'Set Target'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SetTargetDialog;
