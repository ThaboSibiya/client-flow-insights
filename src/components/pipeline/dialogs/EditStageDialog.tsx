import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stage: {
    id: string;
    name: string;
    color: string;
  } | null;
  onEditStage: (stageId: string, name: string, color: string) => void;
}

const EditStageDialog = ({ open, onOpenChange, stage, onEditStage }: EditStageDialogProps) => {
  const [name, setName] = useState(stage?.name || '');
  const [color, setColor] = useState(stage?.color || '#6B7280');

  React.useEffect(() => {
    if (stage) {
      setName(stage.name);
      setColor(stage.color);
    }
  }, [stage]);

  const handleSave = () => {
    if (stage && name.trim()) {
      onEditStage(stage.id, name.trim(), color);
      onOpenChange(false);
    }
  };

  const colorOptions = [
    { name: 'Gray', value: '#6B7280' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Pink', value: '#EC4899' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Stage</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="stage-name">Stage Name</Label>
            <Input
              id="stage-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter stage name"
            />
          </div>
          <div className="space-y-2">
            <Label>Stage Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-12 h-12 rounded-lg border-2 transition-all ${
                    color === option.value 
                      ? 'border-quikle-primary ring-2 ring-quikle-primary/30' 
                      : 'border-quikle-silver hover:border-quikle-slate'
                  }`}
                  style={{ backgroundColor: option.value }}
                  onClick={() => setColor(option.value)}
                  title={option.name}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!name.trim()}
            className="bg-quikle-primary hover:bg-quikle-primary/90 text-white"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditStageDialog;