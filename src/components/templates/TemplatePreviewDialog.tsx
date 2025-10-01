
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { IndustryTemplate, TemplateField } from '@/types/templates';
import { Eye, Plus, X, Save, Sparkles } from 'lucide-react';
import CustomFieldRenderer from './CustomFieldRenderer';

interface TemplatePreviewDialogProps {
  template: IndustryTemplate;
  fields: TemplateField[];
  customFieldValues: Record<string, string>;
  onFieldValueChange: (fieldId: string, value: string) => void;
  loading?: boolean;
  children?: React.ReactNode;
}

interface ExtraField {
  id: string;
  label: string;
  value: string;
}

const TemplatePreviewDialog: React.FC<TemplatePreviewDialogProps> = ({
  template,
  fields,
  customFieldValues,
  onFieldValueChange,
  loading = false,
  children
}) => {
  const [extraFields, setExtraFields] = useState<ExtraField[]>([]);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [open, setOpen] = useState(false);

  const addExtraField = () => {
    if (!newFieldLabel.trim()) return;
    
    const newField: ExtraField = {
      id: `extra_${Date.now()}`,
      label: newFieldLabel.trim(),
      value: ''
    };
    
    setExtraFields(prev => [...prev, newField]);
    setNewFieldLabel('');
  };

  const removeExtraField = (fieldId: string) => {
    setExtraFields(prev => prev.filter(f => f.id !== fieldId));
  };

  const updateExtraField = (fieldId: string, value: string) => {
    setExtraFields(prev => 
      prev.map(f => f.id === fieldId ? { ...f, value } : f)
    );
  };

  const requiredFields = fields.filter(f => f.is_required);
  const optionalFields = fields.filter(f => !f.is_required);
  const completedRequired = requiredFields.filter(f => customFieldValues[f.id]?.trim()).length;
  const completedOptional = optionalFields.filter(f => customFieldValues[f.id]?.trim()).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview Template
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto overscroll-contain">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-quikle-primary/10 to-quikle-secondary/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-quikle-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl text-quikle-primary">
                {template.name} - Live Preview
              </DialogTitle>
              <DialogDescription className="text-sm text-quikle-slate mt-1">
                Fill out the template fields and add custom fields as needed
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-quikle-primary/10 text-quikle-primary">
                {fields.length} template fields
              </Badge>
              {extraFields.length > 0 && (
                <Badge variant="secondary" className="bg-quikle-secondary/10 text-quikle-secondary">
                  +{extraFields.length} custom
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-quikle-crystal/30 to-quikle-platinum/30 rounded-lg border border-quikle-primary/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-quikle-primary">
                {completedRequired}/{requiredFields.length}
              </div>
              <div className="text-xs text-quikle-slate">Required Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-quikle-secondary">
                {completedOptional}/{optionalFields.length}
              </div>
              <div className="text-xs text-quikle-slate">Optional Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-quikle-accent">
                {extraFields.length}
              </div>
              <div className="text-xs text-quikle-slate">Extra Fields</div>
            </div>
          </div>

          {/* Required Fields */}
          {requiredFields.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-quikle-charcoal">Required Information</h3>
                <Badge variant="secondary" className="bg-red-50 text-red-600">
                  Must Complete
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requiredFields
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((field) => (
                    <div 
                      key={field.id}
                      className={`${
                        customFieldValues[field.id]?.trim() 
                          ? 'border-2 border-green-300 bg-green-50/40' 
                          : 'border-2 border-red-300 bg-red-50/40'
                      } rounded-lg p-3`}
                    >
                      <CustomFieldRenderer
                        field={field}
                        value={customFieldValues[field.id] || ''}
                        onChange={(value) => onFieldValueChange(field.id, value)}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Optional Fields */}
          {optionalFields.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-quikle-charcoal">Additional Information</h3>
                <Badge variant="secondary" className="bg-quikle-primary/10 text-quikle-primary">
                  Optional
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {optionalFields
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((field) => (
                    <div 
                      key={field.id}
                      className={`${
                        customFieldValues[field.id]?.trim() 
                          ? 'border-2 border-quikle-primary/40 bg-quikle-crystal/40' 
                          : 'border-2 border-quikle-silver/40 bg-white/50'
                      } rounded-lg p-3`}
                    >
                      <CustomFieldRenderer
                        field={field}
                        value={customFieldValues[field.id] || ''}
                        onChange={(value) => onFieldValueChange(field.id, value)}
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Extra Custom Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-quikle-charcoal">Custom Fields</h3>
                <Badge variant="secondary" className="bg-quikle-accent/10 text-quikle-accent">
                  Your Fields
                </Badge>
              </div>
            </div>

            {/* Add New Field Input */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Enter field name (e.g., 'Preferred Contact Time')"
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addExtraField()}
                />
              </div>
              <Button 
                onClick={addExtraField}
                disabled={!newFieldLabel.trim()}
                className="bg-gradient-to-r from-quikle-accent to-quikle-secondary"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Field
              </Button>
            </div>

            {/* Extra Fields List */}
            {extraFields.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {extraFields.map((field) => (
                  <div 
                    key={field.id}
                    className="bg-gradient-to-r from-quikle-accent/10 to-quikle-secondary/10 rounded-lg p-3 border border-quikle-accent/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Label className="font-medium text-quikle-charcoal">
                        {field.label}
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExtraField(field.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:bg-red-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <Input
                      value={field.value}
                      onChange={(e) => updateExtraField(field.id, e.target.value)}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-quikle-silver/20">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => setOpen(false)}
              className="bg-gradient-to-r from-quikle-primary to-quikle-secondary"
            >
              <Save className="h-4 w-4 mr-2" />
              Apply Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplatePreviewDialog;
