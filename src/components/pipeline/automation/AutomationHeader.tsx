
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import ModernAutomationBuilder from '../ModernAutomationBuilder';

interface AutomationHeaderProps {
  isBuilderOpen: boolean;
  onBuilderOpenChange: (open: boolean) => void;
}

const AutomationHeader = ({ isBuilderOpen, onBuilderOpenChange }: AutomationHeaderProps) => {
  const handleOpenChange = (open: boolean) => {
    onBuilderOpenChange(open);
  };
  
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">Automation Manager</h2>
        <p className="text-muted-foreground">
          Create automated workflows and manage external integrations
        </p>
      </div>
      <div className="flex gap-2">
        <Dialog open={isBuilderOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Automation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0">
            <ModernAutomationBuilder 
              onClose={() => handleOpenChange(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AutomationHeader;
