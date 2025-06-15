
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import AutomationBuilder from '../AutomationBuilder';
import AutomationTemplateSelector from './AutomationTemplateSelector';
import { AutomationTemplate } from '@/data/automation-templates';

interface AutomationHeaderProps {
  isBuilderOpen: boolean;
  onBuilderOpenChange: (open: boolean) => void;
}

const AutomationHeader = ({ isBuilderOpen, onBuilderOpenChange }: AutomationHeaderProps) => {
  const [view, setView] = useState<'selector' | 'builder'>('selector');
  const [initialConfig, setInitialConfig] = useState<AutomationTemplate['config'] | null>(null);

  const handleOpenChange = (open: boolean) => {
    onBuilderOpenChange(open);
    if (!open) {
      setTimeout(() => {
        setView('selector');
        setInitialConfig(null);
      }, 300);
    }
  };

  const handleSelectTemplate = (config: AutomationTemplate['config']) => {
    setInitialConfig(config);
    setView('builder');
  };

  const handleStartFromScratch = () => {
    setInitialConfig({} as AutomationTemplate['config']);
    setView('builder');
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
          <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
            {view === 'selector' ? (
              <>
                <DialogHeader className="p-6 pb-4">
                  <DialogTitle>Create a New Automation</DialogTitle>
                  <DialogDescription>
                    Get started quickly with a pre-built template or build your own from scratch.
                  </DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto px-6 pb-6">
                  <AutomationTemplateSelector 
                    onSelectTemplate={handleSelectTemplate}
                    onStartFromScratch={handleStartFromScratch}
                  />
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col">
                <DialogHeader className="p-6 pb-0">
                  <DialogTitle>Automation Builder</DialogTitle>
                </DialogHeader>
                <div className="flex-grow overflow-y-hidden px-6 pb-6">
                  <AutomationBuilder 
                    onClose={() => handleOpenChange(false)} 
                    initialData={initialConfig} 
                  />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AutomationHeader;
