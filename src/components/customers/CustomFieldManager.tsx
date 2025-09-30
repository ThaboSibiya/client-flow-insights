import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CustomFieldManagerProps {
  customerId: string;
  userId: string;
  onFieldAdded: () => void;
}

interface CustomField {
  fieldName: string;
  fieldLabel: string;
  fieldType: 'text' | 'textarea' | 'number' | 'date' | 'email' | 'phone';
  fieldValue: string;
}

const CustomFieldManager = ({ customerId, userId, onFieldAdded }: CustomFieldManagerProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newField, setNewField] = useState<CustomField>({
    fieldName: '',
    fieldLabel: '',
    fieldType: 'text',
    fieldValue: ''
  });
  const [saving, setSaving] = useState(false);

  const handleAddField = async () => {
    if (!newField.fieldLabel.trim()) {
      toast({
        title: "Validation Error",
        description: "Field label is required",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Generate field name from label if not provided
      const fieldName = newField.fieldName || 
        newField.fieldLabel.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

      // First, create a custom template field entry (without template_id to indicate it's custom)
      const { data: fieldData, error: fieldError } = await supabase
        .from('template_fields')
        .insert({
          field_name: fieldName,
          field_label: newField.fieldLabel,
          field_type: newField.fieldType,
          is_required: false,
          display_order: 999,
          field_options: {}
        })
        .select()
        .single();

      if (fieldError) throw fieldError;

      // Then create the custom data entry with the value
      const { error: dataError } = await supabase
        .from('customer_custom_data')
        .insert({
          customer_id: customerId,
          field_id: fieldData.id,
          user_id: userId,
          field_value: newField.fieldValue
        });

      if (dataError) throw dataError;

      toast({
        title: "Success",
        description: "Custom field added successfully"
      });

      setNewField({
        fieldName: '',
        fieldLabel: '',
        fieldType: 'text',
        fieldValue: ''
      });
      setIsAdding(false);
      onFieldAdded();
    } catch (error) {
      console.error('Error adding custom field:', error);
      toast({
        title: "Error",
        description: "Failed to add custom field",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setNewField({
      fieldName: '',
      fieldLabel: '',
      fieldType: 'text',
      fieldValue: ''
    });
  };

  if (!isAdding) {
    return (
      <Button
        onClick={() => setIsAdding(true)}
        className="bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Custom Field
      </Button>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white to-quikle-crystal/30 border-quikle-primary/20">
      <CardHeader>
        <CardTitle className="text-lg text-quikle-charcoal">Add Custom Field</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fieldLabel">Field Label *</Label>
            <Input
              id="fieldLabel"
              value={newField.fieldLabel}
              onChange={(e) => setNewField({ ...newField, fieldLabel: e.target.value })}
              placeholder="e.g., Company Name"
              className="border-quikle-silver/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fieldType">Field Type</Label>
            <Select
              value={newField.fieldType}
              onValueChange={(value: any) => setNewField({ ...newField, fieldType: value })}
            >
              <SelectTrigger className="border-quikle-silver/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="textarea">Text Area</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fieldValue">Initial Value</Label>
          {newField.fieldType === 'textarea' ? (
            <textarea
              id="fieldValue"
              value={newField.fieldValue}
              onChange={(e) => setNewField({ ...newField, fieldValue: e.target.value })}
              placeholder="Enter initial value (optional)"
              className="w-full min-h-[80px] px-3 py-2 border border-quikle-silver/50 rounded-md"
              rows={3}
            />
          ) : (
            <Input
              id="fieldValue"
              type={newField.fieldType === 'number' ? 'number' : newField.fieldType === 'date' ? 'date' : 'text'}
              value={newField.fieldValue}
              onChange={(e) => setNewField({ ...newField, fieldValue: e.target.value })}
              placeholder="Enter initial value (optional)"
              className="border-quikle-silver/50"
            />
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={saving}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleAddField}
            disabled={saving}
            className="bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Add Field'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomFieldManager;
