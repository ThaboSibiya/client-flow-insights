
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { BuilderField } from './TemplateBuilder';

interface TemplatePreviewProps {
  templateName: string;
  templateIndustry: string;
  templateDescription: string;
  fields: BuilderField[];
}

const TemplatePreview = ({ templateName, templateIndustry, templateDescription, fields }: TemplatePreviewProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedDates, setSelectedDates] = useState<Record<string, Date | undefined>>({});

  const updateFormData = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const renderField = (field: BuilderField) => {
    const fieldId = field.field_name;
    const value = formData[fieldId] || '';

    switch (field.field_type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <Input
            id={fieldId}
            type={field.field_type === 'email' ? 'email' : field.field_type === 'phone' ? 'tel' : 'text'}
            value={value}
            onChange={(e) => updateFormData(fieldId, e.target.value)}
            placeholder={field.field_options?.placeholder || `Enter ${field.field_label.toLowerCase()}...`}
          />
        );

      case 'number':
        return (
          <Input
            id={fieldId}
            type="number"
            value={value}
            onChange={(e) => updateFormData(fieldId, parseFloat(e.target.value) || '')}
            min={field.field_options?.min}
            max={field.field_options?.max}
            placeholder="Enter number..."
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={fieldId}
            value={value}
            onChange={(e) => updateFormData(fieldId, e.target.value)}
            placeholder={field.field_options?.placeholder || 'Enter text...'}
            rows={3}
          />
        );

      case 'select':
        return (
          <Select value={value} onValueChange={(newValue) => updateFormData(fieldId, newValue)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {(field.field_options?.options || []).map((option: string, index: number) => (
                <SelectItem key={index} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'date':
        const selectedDate = selectedDates[fieldId];
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDates(prev => ({ ...prev, [fieldId]: date }));
                  updateFormData(fieldId, date?.toISOString() || '');
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={fieldId}
              checked={value || false}
              onCheckedChange={(checked) => updateFormData(fieldId, checked)}
            />
            <Label htmlFor={fieldId} className="text-sm font-normal">
              {field.field_label}
            </Label>
          </div>
        );

      default:
        return (
          <div className="text-sm text-muted-foreground italic">
            Unsupported field type: {field.field_type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{templateName || 'Untitled Template'}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{templateIndustry || 'No Industry'}</Badge>
                <Badge variant="secondary">Preview Mode</Badge>
              </div>
            </div>
          </div>
          {templateDescription && (
            <p className="text-muted-foreground mt-2">{templateDescription}</p>
          )}
        </CardHeader>
      </Card>

      {/* Form Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Form Preview</CardTitle>
          <p className="text-sm text-muted-foreground">
            This is how the form will appear to users
          </p>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No fields to preview</p>
              <p className="text-sm">Add fields to see the form preview</p>
            </div>
          ) : (
            <form className="space-y-6">
              {fields
                .sort((a, b) => a.display_order - b.display_order)
                .map((field) => (
                  <div key={field.tempId} className="space-y-2">
                    <Label htmlFor={field.field_name} className="flex items-center gap-1">
                      {field.field_label}
                      {field.is_required && (
                        <span className="text-destructive">*</span>
                      )}
                    </Label>
                    {field.field_type !== 'checkbox' ? (
                      renderField(field)
                    ) : (
                      <div className="pt-1">
                        {renderField(field)}
                      </div>
                    )}
                  </div>
                ))}
              
              <div className="pt-4 border-t">
                <Button type="button" className="w-full">
                  Submit Form (Preview Only)
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplatePreview;
