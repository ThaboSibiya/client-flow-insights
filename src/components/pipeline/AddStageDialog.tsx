
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddStage: (name: string, color: string) => void;
}

const colorOptions = [
  '#1F2937', '#374151', '#6B7280', '#059669', 
  '#0369A1', '#7C3AED', '#DC2626', '#64748B'
];

const AddStageDialog = ({ open, onOpenChange, onAddStage }: AddStageDialogProps) => {
  const [stageName, setStageName] = useState('');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stageName.trim()) {
      onAddStage(stageName.trim(), selectedColor);
      setStageName('');
      setSelectedColor(colorOptions[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-quikle-charcoal">Add New Stage</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stageName" className="text-quikle-charcoal">Stage Name</Label>
            <Input
              id="stageName"
              value={stageName}
              onChange={(e) => setStageName(e.target.value)}
              placeholder="Enter stage name..."
              className="border-quikle-silver/50 text-quikle-charcoal"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-quikle-charcoal">Stage Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-105 ${
                    selectedColor === color ? 'border-quikle-primary ring-2 ring-quikle-primary/30' : 'border-quikle-silver hover:border-quikle-slate'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="border-quikle-silver text-quikle-charcoal hover:bg-quikle-crystal hover:border-quikle-slate"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-quikle-primary hover:bg-quikle-secondary text-white border-none"
            >
              Add Stage
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStageDialog;
