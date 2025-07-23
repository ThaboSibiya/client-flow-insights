
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { BuilderField } from './TemplateBuilder';

interface FieldOptionsEditorProps {
  field: BuilderField;
  onUpdateField: (tempId: string, updates: Partial<BuilderField>) => void;
}

const FieldOptionsEditor = ({ field, onUpdateField }: FieldOptionsEditorProps) => {
  const updateFieldOptions = (newOptions: any) => {
    onUpdateField(field.tempId, {
      field_options: { ...field.field_options, ...newOptions }
    });
  };

  const renderOptionsForFieldType = () => {
    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <div>
            <Label className="text-sm">Placeholder Text</Label>
            <Input
              value={field.field_options?.placeholder || ''}
              onChange={(e) => updateFieldOptions({ placeholder: e.target.value })}
              placeholder="Enter placeholder..."
              className="text-sm"
            />
          </div>
        );

      case 'textarea':
        return (
          <div>
            <Label className="text-sm">Placeholder Text</Label>
            <Textarea
              value={field.field_options?.placeholder || ''}
              onChange={(e) => updateFieldOptions({ placeholder: e.target.value })}
              placeholder="Enter placeholder..."
              rows={2}
              className="text-sm"
            />
          </div>
        );

      case 'number':
        return (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-sm">Min Value</Label>
              <Input
                type="number"
                value={field.field_options?.min || ''}
                onChange={(e) => updateFieldOptions({ min: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className="text-sm"
              />
            </div>
            <div>
              <Label className="text-sm">Max Value</Label>
              <Input
                type="number"
                value={field.field_options?.max || ''}
                onChange={(e) => updateFieldOptions({ max: parseFloat(e.target.value) || 100 })}
                placeholder="100"
                className="text-sm"
              />
            </div>
          </div>
        );

      case 'select':
        const options = field.field_options?.options || [];
        return (
          <div>
            <Label className="text-sm mb-2 block">Dropdown Options</Label>
            <div className="space-y-2">
              {options.map((option: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...options];
                      newOptions[index] = e.target.value;
                      updateFieldOptions({ options: newOptions });
                    }}
                    placeholder={`Option ${index + 1}`}
                    className="text-sm flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newOptions = options.filter((_: any, i: number) => i !== index);
                      updateFieldOptions({ options: newOptions });
                    }}
                    className="text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newOptions = [...options, `Option ${options.length + 1}`];
                  updateFieldOptions({ options: newOptions });
                }}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const hasOptions = ['text', 'email', 'phone', 'textarea', 'number', 'select'].includes(field.field_type);

  if (!hasOptions) {
    return null;
  }

  return (
    <div className="border-t pt-4">
      <Label className="text-sm font-medium text-muted-foreground mb-3 block">
        Field Options
      </Label>
      {renderOptionsForFieldType()}
    </div>
  );
};

export default FieldOptionsEditor;
