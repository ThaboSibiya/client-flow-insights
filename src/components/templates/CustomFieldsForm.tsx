
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CustomDataService } from '@/services/customDataService';
import { CustomFieldValue } from '@/types/customData';
import { useAuth } from '@/context/AuthContext';
import { Save, Loader2 } from 'lucide-react';

interface CustomFieldsFormProps {
  customerId: string;
  customFields: CustomFieldValue[];
  onFieldsUpdated?: () => void;
}

const CustomFieldsForm: React.FC<CustomFieldsFormProps> = ({
  customerId,
  customFields,
  onFieldsUpdated
}) => {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    customFields.forEach(field => {
      initial[field.field_name] = field.field_value || '';
    });
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFieldChange = (fieldName: string, value: string) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Find fields that have changed and update them
      const updatePromises = customFields
        .filter(field => fieldValues[field.field_name] !== field.field_value)
        .map(async (field) => {
          // We need to get the field_id first
          const { data: fieldData } = await supabase
            .from('template_fields')
            .select('id')
            .eq('field_name', field.field_name)
            .single();

          if (fieldData) {
            await CustomDataService.updateCustomFieldValue(
              customerId,
              fieldData.id,
              fieldValues[field.field_name],
              user.id
            );
          }
        });

      await Promise.all(updatePromises);

      toast({
        title: "Success",
        description: "Custom fields updated successfully"
      });

      onFieldsUpdated?.();
    } catch (error) {
      console.error('Error updating custom fields:', error);
      toast({
        title: "Error",
        description: "Failed to update custom fields",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const renderField = (field: CustomFieldValue) => {
    const value = fieldValues[field.field_name] || '';

    switch (field.field_type) {
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
            placeholder={`Enter ${field.field_label.toLowerCase()}`}
            rows={3}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={value === 'true'}
              onCheckedChange={(checked) => handleFieldChange(field.field_name, checked.toString())}
            />
            <span className="text-sm text-gray-600">
              {value === 'true' ? 'Yes' : 'No'}
            </span>
          </div>
        );

      case 'select':
        const options = field.field_options?.options || [];
        return (
          <Select
            value={value}
            onValueChange={(newValue) => handleFieldChange(field.field_name, newValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.field_label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
            placeholder={`Enter ${field.field_label.toLowerCase()}`}
          />
        );

      case 'email':
        return (
          <Input
            type="email"
            value={value}
            onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
            placeholder={`Enter ${field.field_label.toLowerCase()}`}
          />
        );

      case 'phone':
        return (
          <Input
            type="tel"
            value={value}
            onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
            placeholder={`Enter ${field.field_label.toLowerCase()}`}
          />
        );

      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
            placeholder={`Enter ${field.field_label.toLowerCase()}`}
          />
        );
    }
  };

  if (customFields.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Edit Custom Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {customFields.map((field, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor={field.field_name} className="text-sm font-medium">
                {field.field_label}
              </Label>
              {field.is_required && (
                <Badge variant="secondary" className="text-xs">Required</Badge>
              )}
            </div>
            {renderField(field)}
          </div>
        ))}

        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full mt-6"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
};

export default CustomFieldsForm;
