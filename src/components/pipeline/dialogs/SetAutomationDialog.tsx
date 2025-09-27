import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Zap, CheckCircle } from "lucide-react";

interface SetAutomationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: {
    id: string;
    name: string;
    automationEnabled: boolean;
  } | null;
  onSetAutomation: (stageId: string, enabled: boolean) => void;
}

const SetAutomationDialog = ({ open, onOpenChange, stage, onSetAutomation }: SetAutomationDialogProps) => {
  const [automationEnabled, setAutomationEnabled] = useState(stage?.automationEnabled || false);

  React.useEffect(() => {
    if (stage) {
      setAutomationEnabled(stage.automationEnabled);
    }
  }, [stage]);

  const handleSave = () => {
    if (stage) {
      onSetAutomation(stage.id, automationEnabled);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-quikle-accent" />
            Automation Settings for "{stage?.name}"
          </DialogTitle>
          <DialogDescription>
            Configure automation rules that will trigger when items enter this stage.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="automation-toggle" className="text-base font-medium">
                Enable Automation
              </Label>
              <p className="text-sm text-quikle-slate">
                Automatically trigger actions when items enter this stage
              </p>
            </div>
            <Switch
              id="automation-toggle"
              checked={automationEnabled}
              onCheckedChange={setAutomationEnabled}
            />
          </div>
          
          {automationEnabled && (
            <div className="bg-quikle-crystal/50 p-4 rounded-lg border border-quikle-silver/30">
              <div className="flex items-center gap-2 text-quikle-primary mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Automation Features</span>
              </div>
              <ul className="text-sm text-quikle-slate space-y-1 ml-6">
                <li>• Auto-assign to team members</li>
                <li>• Send notification emails</li>
                <li>• Update customer status</li>
                <li>• Create follow-up tasks</li>
              </ul>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-quikle-primary hover:bg-quikle-primary/90 text-white"
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SetAutomationDialog;