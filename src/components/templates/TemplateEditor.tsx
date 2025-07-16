
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { CustomDataService } from '@/services/customDataService';
import { IndustryTemplate, TemplateField } from '@/types/customData';
import { Plus, Trash2, Edit, Save, X, GripVertical, Building2, Shield, Heart, Scale, DollarSign, Printer } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const TemplateEditor = () => {
  const [templates, setTemplates] = useState<IndustryTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<IndustryTemplate | null>(null);
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const industryIcons = {
    real_estate: Building2,
    insurance: Shield,
    healthcare: Heart,
    legal: Scale,
    finance: DollarSign,
    printer_service: Printer
  };

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
      setFields(templateFields);
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
    setEditingField(null);
    loadTemplateFields(template.id);
  };

  const addNewField = () => {
    const newField: TemplateField = {
      id: `temp-${Date.now()}`,
      template_id: selectedTemplate?.id || '',
      field_name: '',
      field_label: '',
      field_type: 'text',
      is_required: false,
      display_order: fields.length + 1,
      created_at: new Date().toISOString()
    };
    setFields([...fields, newField]);
    setEditingField(newField.id);
  };

  const updateField = (id: string, updates: Partial<TemplateField>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const saveField = async (field: TemplateField) => {
    if (!selectedTemplate) return;

    try {
      if (field.id.startsWith('temp-')) {
        // Create new field
        const newField = await CustomDataService.createTemplateField(selectedTemplate.id, {
          field_name: field.field_name,
          field_label: field.field_label,
          field_type: field.field_type,
          field_options: field.field_options,
          is_required: field.is_required,
          display_order: field.display_order
        });

        setFields(fields.map(f => f.id === field.id ? newField : f));
      } else {
        // Update existing field
        await CustomDataService.updateTemplateField(field.id, {
          field_name: field.field_name,
          field_label: field.field_label,
          field_type: field.field_type,
          field_options: field.field_options,
          is_required: field.is_required,
          display_order: field.display_order
        });
      }

      setEditingField(null);
      toast({
        title: "Success",
        description: "Field saved successfully"
      });
    } catch (error) {
      console.error('Error saving field:', error);
      toast({
        title: "Error",
        description: "Failed to save field",
        variant: "destructive"
      });
    }
  };

  const deleteField = async (id: string) => {
    try {
      if (!id.startsWith('temp-')) {
        await CustomDataService.deleteTemplateField(id);
      }
      setFields(fields.filter(field => field.id !== id));
      toast({
        title: "Success",
        description: "Field deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting field:', error);
      toast({
        title: "Error",
        description: "Failed to delete field",
        variant: "destructive"
      });
    }
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

  const FieldEditor = ({ field }: { field: TemplateField }) => {
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
              onChange={(e) => updateField(field.id, { field_name: e.target.value.replace(/\s+/g, '_').toLowerCase() })}
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
            <Checkbox
              id={`required-${field.id}`}
              checked={field.is_required}
              onCheckedChange={(checked) => updateField(field.id, { is_required: !!checked })}
            />
            <Label htmlFor={`required-${field.id}`}>Required Field</Label>
          </div>
        </div>
        
        {field.field_type === 'select' && (
          <div className="mt-4">
            <Label>Options (one per line)</Label>
            <Textarea
              value={field.field_options?.options?.join('\n') || ''}
              onChange={(e) => updateField(field.id, {
                field_options: { options: e.target.value.split('\n').filter(Boolean) }
              })}
              placeholder="Option 1&#10;Option 2&#10;Option 3"
              rows={3}
            />
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setEditingField(null)}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={() => saveField(field)}>
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
            {templates.map(template => {
              const Icon = industryIcons[template.industry as keyof typeof industryIcons] || Building2;
              
              return (
                <div
                  key={template.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-quikle-primary bg-quikle-crystal/50'
                      : 'border-quikle-silver/30 hover:border-quikle-primary/50'
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="h-5 w-5 text-quikle-primary" />
                    <h3 className="font-medium text-quikle-charcoal">{template.name}</h3>
                  </div>
                  <p className="text-sm text-quikle-slate/70 mb-2">{template.description}</p>
                  <Badge variant="secondary">
                    {template.industry.replace('_', ' ')}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedTemplate && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Editing: {selectedTemplate.name}</CardTitle>
              <Button onClick={addNewField} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
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
