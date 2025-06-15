
import React from 'react';
import { automationTemplates, AutomationTemplate } from '@/data/automation-templates';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight } from 'lucide-react';

interface AutomationTemplateSelectorProps {
  onSelectTemplate: (config: AutomationTemplate['config']) => void;
  onStartFromScratch: () => void;
}

const AutomationTemplateSelector = ({ onSelectTemplate, onStartFromScratch }: AutomationTemplateSelectorProps) => {
  return (
    <div className="p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card 
          className="flex flex-col justify-between cursor-pointer group hover:border-quikle-primary transition-all"
          onClick={onStartFromScratch}
        >
          <CardHeader>
            <div className="bg-muted rounded-md w-12 h-12 flex items-center justify-center mb-4 border group-hover:border-quikle-primary transition-all">
              <Plus className="w-6 h-6 text-muted-foreground group-hover:text-quikle-primary transition-all" />
            </div>
            <h3 className="text-lg font-semibold leading-none tracking-tight text-card-foreground">Start from Scratch</h3>
            <p className="text-sm text-muted-foreground pt-1">Build a custom automation from the ground up.</p>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="w-full justify-start p-0 h-auto font-semibold text-quikle-primary">
              Build Custom Automation <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {automationTemplates.map((template) => (
          <Card 
            key={template.id} 
            className="flex flex-col justify-between cursor-pointer group hover:border-quikle-primary transition-all"
            onClick={() => onSelectTemplate(template.config)}
          >
            <CardHeader>
              <div className="bg-muted rounded-md w-12 h-12 flex items-center justify-center mb-4 border group-hover:border-quikle-primary transition-all">
                <template.icon className="w-6 h-6 text-quikle-primary" />
              </div>
              <h3 className="text-lg font-semibold leading-none tracking-tight text-card-foreground">{template.name}</h3>
              <p className="text-sm text-muted-foreground pt-1">{template.description}</p>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full justify-start p-0 h-auto font-semibold text-quikle-primary">
                Use Template <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AutomationTemplateSelector;
