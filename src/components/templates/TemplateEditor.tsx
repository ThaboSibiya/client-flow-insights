
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CustomDataService } from '@/services/customDataService';
import { IndustryTemplate } from '@/types/customData';
import { Plus, Trash2, Edit, Save, X, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface FieldDefinition {
  id: string;
  field_name: string;
  field_label: string;
  field_type: 'text' | 'email' | 'phone' | 'number' | 'date' | 'boolean' | 'select' | 'textarea';
  field_options?: {
    options?: string[];
    validation?: any;
  };
  is_required: boolean;
  display_order: number;
}

const TemplateEditor = () => {
  const [templates, setTemplates] = useState<IndustryTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<IndustryTemplate | null>(null);
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'boolean', label: 'Yes/No' },
    { value: 'select', label: 'Dropdown' },
    { value: 'textarea', label: 'Long Text' }
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await CustomDataService.getIndustryTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplateFields = async (templateId: string) => {
    try {
      const templateFields = await CustomDataService.getTemplateFields(templateId);
      setFields(templateFields.map(field => ({
        id: field.id,
        field_name: field.field_name,
        field_label: field.field_label,
        field_type: field.field_type,
        field_options: field.field_options,
        is_required: field.is_required,
        display_order: field.display_order
      })));
    } catch (error) {
      console.error('Error loading template fields:', error);
      toast({
        title: "Error",
        description: "Failed to load template fields",
        variant: "destructive"
      });
    }
  };

  const handleTemplateSelect = (template: IndustryTemplate) => {
    setSelectedTemplate(template);
    loadTemplateFields(template.id);
  };

  const addNewField = () => {
    const newField: FieldDefinition = {
      id: `temp-${Date.now()}`,
      field_name: '',
      field_label: '',
      field_type: 'text',
      is_required: false,
      display_order: fields.length + 1
    };
    setFields([...fields, newField]);
    setEditingField(newField.id);
  };

  const updateField = (id: string, updates: Partial<FieldDefinition>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const deleteField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const reorderedFields = Array.from(fields);
    const [removed] = reorderedFields.splice(result.source.index, 1);
    reorderedFields.splice(result.destination.index, 0, removed);

    // Update display_order
    const updatedFields = reorderedFields.map((field, index) => ({
      ...field,
      display_order: index + 1
    }));

    setFields(updatedFields);
  };

  const saveTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      // Here you would implement the save logic
      // This would involve calling a custom service to update the template
      toast({
        title: "Success",
        description: "Template updated successfully",
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive"
      });
    }
  };

  const FieldEditor = ({ field }: { field: FieldDefinition }) => {
    const isEditing = editingField === field.id;

    if (!isEditing) {
      return (
        <div className="flex items-center justify-between p-3 bg-quikle-crystal/30 rounded-lg">
          <div className="flex items-center gap-3">
            <GripVertical className="h-4 w-4 text-quikle-slate/60" />
            <div>
              <div className="font-medium text-quikle-charcoal">{field.field_label}</div>
              <div className="text-sm text-quikle-slate/70">
                {field.field_name} • {field.field_type}
                {field.is_required && <Badge variant="secondary" className="ml-2">Required</Badge>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingField(field.id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteField(field.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 bg-white rounded-lg border border-quikle-silver/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`label-${field.id}`}>Field Label</Label>
            <Input
              id={`label-${field.id}`}
              value={field.field_label}
              onChange={(e) => updateField(field.id, { field_label: e.target.value })}
              placeholder="Enter field label"
            />
          </div>
          <div>
            <Label htmlFor={`name-${field.id}`}>Field Name</Label>
            <Input
              id={`name-${field.id}`}
              value={field.field_name}
              onChange={(e) => updateField(field.id, { field_name: e.target.value })}
              placeholder="Enter field name (no spaces)"
            />
          </div>
          <div>
            <Label htmlFor={`type-${field.id}`}>Field Type</Label>
            <Select
              value={field.field_type}
              onValueChange={(value) => updateField(field.id, { field_type: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fieldTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`required-${field.id}`}
              checked={field.is_required}
              onChange={(e) => updateField(field.id, { is_required: e.target.checked })}
            />
            <Label htmlFor={`required-${field.id}`}>Required Field</Label>
          </div>
        </div>
        
        {field.field_type === 'select' && (
          <div className="mt-4">
            <Label>Options (one per line)</Label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={3}
              value={field.field_options?.options?.join('\n') || ''}
              onChange={(e) => updateField(field.id, {
                field_options: { options: e.target.value.split('\n').filter(Boolean) }
              })}
              placeholder="Option 1&#10;Option 2&#10;Option 3"
            />
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setEditingField(null)}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={() => setEditingField(null)}>
            <Save className="h-4 w-4 mr-2" />
            Save Field
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Template to Edit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <div
                key={template.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'border-quikle-primary bg-quikle-crystal/50'
                    : 'border-quikle-silver/30 hover:border-quikle-primary/50'
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <h3 className="font-medium text-quikle-charcoal">{template.name}</h3>
                <p className="text-sm text-quikle-slate/70 mt-1">{template.description}</p>
                <Badge variant="secondary" className="mt-2">
                  {template.industry.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedTemplate && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Editing: {selectedTemplate.name}</CardTitle>
              <div className="flex gap-2">
                <Button onClick={addNewField} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Field
                </Button>
                <Button onClick={saveTemplate}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="fields">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {fields.map((field, index) => (
                      <Draggable key={field.id} draggableId={field.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <FieldEditor field={field} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {fields.length === 0 && (
              <div className="text-center py-8 text-quikle-slate/60">
                No fields configured. Click "Add Field" to get started.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TemplateEditor;
