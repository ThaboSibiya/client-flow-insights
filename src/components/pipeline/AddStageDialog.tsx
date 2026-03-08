import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddStage: (name: string, color: string) => void;
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

const AddStageDialog = ({ open, onOpenChange, onAddStage }: AddStageDialogProps) => {
  const [stageName, setStageName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stageName.trim()) {
      onAddStage(stageName.trim(), selectedColor);
      setStageName('');
      setSelectedColor(COLOR_OPTIONS[0].value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Stage</DialogTitle>
          <DialogDescription>Create a new stage for your pipeline.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stageName">Stage Name</Label>
            <Input
              id="stageName"
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              placeholder="e.g., Qualified, In Review..."
              autoFocus
              required
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
                    selectedColor === option.value 
                      ? 'border-primary ring-2 ring-primary/30' 
                      : 'border-border hover:border-muted-foreground'
                  }`}
                  style={{ backgroundColor: option.value }}
                  onClick={() => setSelectedColor(option.value)}
                  title={option.name}
                />
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!stageName.trim()}>
              Add Stage
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStageDialog;
