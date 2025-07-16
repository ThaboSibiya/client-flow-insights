
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Building2, Shield, Heart, Scale, DollarSign, Printer } from 'lucide-react';

interface CustomTemplate {
  name: string;
  industry: string;
  description: string;
  fields: Array<{
    id: string;
    field_name: string;
    field_label: string;
    field_type: string;
    is_required: boolean;
  }>;
}

const CustomTemplateManager = () => {
  const [template, setTemplate] = useState<CustomTemplate>({
    name: '',
    industry: '',
    description: '',
    fields: []
  });
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const industries = [
    { value: 'real_estate', label: 'Real Estate', icon: Building2 },
    { value: 'insurance', label: 'Insurance', icon: Shield },
    { value: 'healthcare', label: 'Healthcare', icon: Heart },
    { value: 'legal', label: 'Legal', icon: Scale },
    { value: 'finance', label: 'Finance', icon: DollarSign },
    { value: 'printer_service', label: 'Printer Service', icon: Printer },
    { value: 'custom', label: 'Custom Industry', icon: Building2 }
  ];

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

  const addField = () => {
    const newField = {
      id: `field-${Date.now()}`,
      field_name: '',
      field_label: '',
      field_type: 'text',
      is_required: false
    };
    setTemplate(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const updateField = (id: string, updates: any) => {
    setTemplate(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.id === id ? { ...field, ...updates } : field
      )
    }));
  };

  const removeField = (id: string) => {
    setTemplate(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== id)
    }));
  };

  const saveTemplate = async () => {
    if (!template.name || !template.industry) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      // Here you would implement the save logic
      // This would involve creating a new template in the database
      toast({
        title: "Success",
        description: "Custom template created successfully",
      });
      
      // Reset form
      setTemplate({
        name: '',
        industry: '',
        description: '',
        fields: []
      });
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Custom Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="template-name">Template Name *</Label>
              <Input
                id="template-name"
                value={template.name}
                onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter template name"
              />
            </div>
            <div>
              <Label htmlFor="template-industry">Industry *</Label>
              <Select
                value={template.industry}
                onValueChange={(value) => setTemplate(prev => ({ ...prev, industry: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map(industry => (
                    <SelectItem key={industry.value} value={industry.value}>
                      <div className="flex items-center gap-2">
                        <industry.icon className="h-4 w-4" />
                        {industry.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              value={template.description}
              onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this template is for..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Template Fields</CardTitle>
            <Button onClick={addField} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {template.fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg bg-quikle-crystal/30">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <Label htmlFor={`field-label-${field.id}`}>Field Label</Label>
                    <Input
                      id={`field-label-${field.id}`}
                      value={field.field_label}
                      onChange={(e) => updateField(field.id, { field_label: e.target.value })}
                      placeholder="Enter field label"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`field-name-${field.id}`}>Field Name</Label>
                    <Input
                      id={`field-name-${field.id}`}
                      value={field.field_name}
                      onChange={(e) => updateField(field.id, { field_name: e.target.value })}
                      placeholder="field_name"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`field-type-${field.id}`}>Field Type</Label>
                    <Select
                      value={field.field_type}
                      onValueChange={(value) => updateField(field.id, { field_type: value })}
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
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`required-${field.id}`}
                      checked={field.is_required}
                      onChange={(e) => updateField(field.id, { is_required: e.target.checked })}
                    />
                    <Label htmlFor={`required-${field.id}`}>Required</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(field.id)}
                      className="ml-2"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {template.fields.length === 0 && (
              <div className="text-center py-8 text-quikle-slate/60">
                No fields added yet. Click "Add Field" to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveTemplate} disabled={isCreating}>
          {isCreating ? (
            <>
              <Save className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Create Template
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CustomTemplateManager;
