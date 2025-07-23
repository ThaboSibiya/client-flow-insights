
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Eye, ArrowLeft } from "lucide-react";
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import FieldTypePalette from './FieldTypePalette';
import TemplateFieldsList from './TemplateFieldsList';
import TemplatePreview from './TemplatePreview';
import { TemplateField } from '@/types/templates';
import { toast } from '@/hooks/use-toast';

interface TemplateBuilderProps {
  onBack?: () => void;
  existingTemplate?: any;
}

export interface BuilderField extends Omit<TemplateField, 'id' | 'template_id' | 'created_at'> {
  id: string;
  tempId: string;
}

const TemplateBuilder = ({ onBack, existingTemplate }: TemplateBuilderProps) => {
  const [templateName, setTemplateName] = useState(existingTemplate?.name || '');
  const [templateIndustry, setTemplateIndustry] = useState(existingTemplate?.industry || '');
  const [templateDescription, setTemplateDescription] = useState(existingTemplate?.description || '');
  const [fields, setFields] = useState<BuilderField[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    // Handle dropping from palette
    if (active.id.toString().startsWith('palette-')) {
      const fieldType = active.id.toString().replace('palette-', '');
      addField(fieldType);
      return;
    }

    // Handle reordering existing fields
    if (active.id !== over.id) {
      const oldIndex = fields.findIndex(field => field.tempId === active.id);
      const newIndex = fields.findIndex(field => field.tempId === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newFields = [...fields];
        const [removed] = newFields.splice(oldIndex, 1);
        newFields.splice(newIndex, 0, removed);
        
        // Update display order
        const updatedFields = newFields.map((field, index) => ({
          ...field,
          display_order: index
        }));
        
        setFields(updatedFields);
      }
    }
  };

  const addField = (fieldType: string) => {
    const newField: BuilderField = {
      id: '',
      tempId: `field-${Date.now()}-${Math.random()}`,
      field_name: `${fieldType}_field_${fields.length + 1}`,
      field_label: `${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Field`,
      field_type: fieldType,
      field_options: getDefaultFieldOptions(fieldType),
      is_required: false,
      display_order: fields.length
    };

    setFields(prev => [...prev, newField]);
    toast({
      title: "Field Added",
      description: `${fieldType} field has been added to your template.`,
    });
  };

  const updateField = (tempId: string, updates: Partial<BuilderField>) => {
    setFields(prev => prev.map(field => 
      field.tempId === tempId ? { ...field, ...updates } : field
    ));
  };

  const removeField = (tempId: string) => {
    setFields(prev => prev.filter(field => field.tempId !== tempId));
    toast({
      title: "Field Removed",
      description: "Field has been removed from your template.",
    });
  };

  const getDefaultFieldOptions = (fieldType: string) => {
    switch (fieldType) {
      case 'select':
        return { options: ['Option 1', 'Option 2', 'Option 3'] };
      case 'number':
        return { min: 0, max: 100 };
      case 'text':
      case 'email':
      case 'phone':
        return { placeholder: `Enter ${fieldType}...` };
      case 'textarea':
        return { placeholder: 'Enter description...' };
      default:
        return {};
    }
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast({
        title: "Validation Error",
        description: "Template name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!templateIndustry.trim()) {
      toast({
        title: "Validation Error", 
        description: "Industry is required.",
        variant: "destructive",
      });
      return;
    }

    if (fields.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one field is required.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // TODO: Implement actual save functionality with templateService
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Template Saved",
        description: "Your custom template has been saved successfully.",
      });
      
      onBack?.();
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isPreviewMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setIsPreviewMode(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Builder
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
        <TemplatePreview
          templateName={templateName}
          templateIndustry={templateIndustry}
          templateDescription={templateDescription}
          fields={fields}
        />
      </div>
    );
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <h1 className="text-2xl font-bold">Template Builder</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsPreviewMode(true)}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Template'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Template Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Enter template name..."
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={templateIndustry}
                    onChange={(e) => setTemplateIndustry(e.target.value)}
                    placeholder="e.g., Healthcare, Real Estate..."
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Describe this template..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <FieldTypePalette />
          </div>

          {/* Fields Builder */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Template Fields</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Drag field types from the palette or reorder existing fields
                </p>
              </CardHeader>
              <CardContent>
                <SortableContext items={fields.map(f => f.tempId)} strategy={verticalListSortingStrategy}>
                  <TemplateFieldsList
                    fields={fields}
                    onUpdateField={updateField}
                    onRemoveField={removeField}
                  />
                </SortableContext>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default TemplateBuilder;
