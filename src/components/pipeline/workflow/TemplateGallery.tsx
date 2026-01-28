
import React, { useState } from 'react';
import { Users, Bot, GitBranch, Webhook, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WORKFLOW_TEMPLATES } from './constants';
import { WorkflowTemplate } from './types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Bot,
  GitBranch,
  Webhook,
};

interface TemplateGalleryProps {
  onSelectTemplate: (template: WorkflowTemplate) => void;
  onStartFromScratch: () => void;
}

const TemplateGallery = ({ onSelectTemplate, onStartFromScratch }: TemplateGalleryProps) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'customer', label: 'Customer' },
    { id: 'ai_agent', label: 'AI Agent' },
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'integration', label: 'Integration' },
  ];

  const filteredTemplates = activeCategory === 'all' 
    ? WORKFLOW_TEMPLATES 
    : WORKFLOW_TEMPLATES.filter(t => t.category === activeCategory);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Create New Automation</h2>
        <p className="text-muted-foreground">
          Choose a template to get started or build from scratch
        </p>
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={onStartFromScratch}
          variant="outline"
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Start from Scratch
        </Button>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-5">
          {categories.map(cat => (
            <TabsTrigger key={cat.id} value={cat.id}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map(template => {
              const Icon = iconMap[template.icon] || GitBranch;
              
              return (
                <Card 
                  key={template.id}
                  className="group cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-200"
                  onClick={() => onSelectTemplate(template)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{template.name}</h3>
                          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs capitalize">
                            {template.category.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {template.nodes.length} nodes
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TemplateGallery;
