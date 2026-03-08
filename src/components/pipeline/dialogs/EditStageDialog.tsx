import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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

const COLOR_OPTIONS = [
  { name: 'Slate', value: 'hsl(var(--muted-foreground))' },
  { name: 'Primary', value: 'hsl(var(--primary))' },
  { name: 'Green', value: 'hsl(142 76% 36%)' },
  { name: 'Blue', value: 'hsl(217 91% 60%)' },
  { name: 'Purple', value: 'hsl(263 70% 50%)' },
  { name: 'Amber', value: 'hsl(38 92% 50%)' },
  { name: 'Red', value: 'hsl(var(--destructive))' },
  { name: 'Teal', value: 'hsl(172 66% 50%)' },
];

const EditStageDialog = ({ open, onOpenChange, stage, onEditStage }: EditStageDialogProps) => {
  const [name, setName] = useState(stage?.name || '');
  const [color, setColor] = useState(stage?.color || COLOR_OPTIONS[0].value);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Stage</DialogTitle>
          <DialogDescription>Modify the name and color of this pipeline stage.</DialogDescription>
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
              {COLOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-105 ${
                    color === option.value 
                      ? 'border-primary ring-2 ring-primary/30' 
                      : 'border-border hover:border-muted-foreground'
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditStageDialog;
