
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AutomationBuilder from '../AutomationBuilder';

interface AutomationHeaderProps {
  isBuilderOpen: boolean;
  onBuilderOpenChange: (open: boolean) => void;
}

const AutomationHeader = ({ isBuilderOpen, onBuilderOpenChange }: AutomationHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">Automation Manager</h2>
        <p className="text-muted-foreground">
          Create automated workflows and manage external integrations
        </p>
      </div>
      <div className="flex gap-2">
        <Dialog open={isBuilderOpen} onOpenChange={onBuilderOpenChange}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Automation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Automation Builder</DialogTitle>
            </DialogHeader>
            <AutomationBuilder onClose={() => onBuilderOpenChange(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AutomationHeader;
