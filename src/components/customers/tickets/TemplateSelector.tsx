
import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TicketTemplate } from '@/types/customer';

interface TemplateSelectorProps {
  templates: TicketTemplate[];
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
}

const TemplateSelector = ({ 
  templates, 
  selectedTemplate, 
  onTemplateSelect 
}: TemplateSelectorProps) => {
  return (
    <div className="mb-4">
      <Label className="block text-sm font-medium mb-2">Use Template (Optional)</Label>
      <Select value={selectedTemplate} onValueChange={onTemplateSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select a template..." />
        </SelectTrigger>
        <SelectContent>
          {templates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              <div className="flex flex-col">
                <span className="font-medium">{template.name}</span>
                <span className="text-xs text-gray-500">{template.category}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TemplateSelector;
