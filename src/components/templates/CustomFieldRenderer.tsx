
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { TemplateField } from '@/types/templates';

interface CustomFieldRendererProps {
  field: TemplateField;
  value: string;
  onChange: (value: string) => void;
  form?: any; // Optional form control for integration with react-hook-form
}

const CustomFieldRenderer: React.FC<CustomFieldRendererProps> = ({
  field,
  value,
  onChange,
  form
}) => {
  const fieldId = `custom_field_${field.id}`;
  const options = field.field_options?.options || [];

  const renderFieldControl = () => {
    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <Input
            id={fieldId}
            type={field.field_type === 'email' ? 'email' : field.field_type === 'phone' ? 'tel' : 'text'}
            placeholder={field.field_options?.placeholder || `Enter ${field.field_label.toLowerCase()}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case 'number':
        return (
          <Input
            id={fieldId}
            type="number"
            placeholder={field.field_options?.placeholder || `Enter ${field.field_label.toLowerCase()}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            min={field.field_options?.min}
            max={field.field_options?.max}
          />
        );

      case 'date':
        return (
          <Input
            id={fieldId}
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case 'select':
        return (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.field_label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'textarea':
        return (
          <Textarea
            id={fieldId}
            placeholder={field.field_options?.placeholder || `Enter ${field.field_label.toLowerCase()}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="resize-none min-h-[80px]"
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={fieldId}
              checked={value === 'true'}
              onCheckedChange={(checked) => onChange(checked ? 'true' : 'false')}
            />
            <label
              htmlFor={fieldId}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {field.field_label}
            </label>
          </div>
        );

      default:
        return (
          <Input
            id={fieldId}
            placeholder={`Enter ${field.field_label.toLowerCase()}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  };

  // If checkbox, render without the standard form wrapper
  if (field.field_type === 'checkbox') {
    return (
      <div className="space-y-2">
        {renderFieldControl()}
      </div>
    );
  }

  // If using react-hook-form, integrate with FormField
  if (form) {
    return (
      <FormField
        control={form.control}
        name={fieldId}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel>
              {field.field_label}
              {field.is_required && <span className="text-red-500 ml-1">*</span>}
            </FormLabel>
            <FormControl>
              {renderFieldControl()}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  // Standalone render
  return (
    <div className="space-y-2">
      <label htmlFor={fieldId} className="text-sm font-medium leading-none">
        {field.field_label}
        {field.is_required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderFieldControl()}
    </div>
  );
};

export default CustomFieldRenderer;
