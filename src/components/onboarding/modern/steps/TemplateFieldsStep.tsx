import React from 'react';
import { Badge } from '@/components/ui/badge';
import { IndustryTemplate, TemplateField } from '@/types/templates';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import CustomFieldRenderer from '@/components/templates/CustomFieldRenderer';

interface TemplateFieldsStepProps {
  template: IndustryTemplate;
  fields: TemplateField[];
  values: Record<string, string>;
  onUpdateField: (fieldId: string, value: string) => void;
  isLoading: boolean;
}

const TemplateFieldsStep: React.FC<TemplateFieldsStepProps> = ({
  template,
  fields,
  values,
  onUpdateField,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-quikle-primary mb-4" />
        <p className="text-quikle-slate">Loading template fields...</p>
      </div>
    );
  }

  const requiredFields = fields.filter(f => f.is_required);
  const optionalFields = fields.filter(f => !f.is_required);
  
  const completedRequired = requiredFields.filter(f => values[f.id]?.trim()).length;
  const completedOptional = optionalFields.filter(f => values[f.id]?.trim()).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-quikle-charcoal mb-2">
          {template.name} Details
        </h2>
        <p className="text-quikle-slate">
          Fill in the industry-specific information for this customer
        </p>
      </div>

      {/* Progress Summary */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200">
          {completedRequired === requiredFields.length ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
          <span className="text-sm font-medium">
            {completedRequired}/{requiredFields.length} Required
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200">
          <span className="text-sm font-medium text-blue-700">
            {completedOptional}/{optionalFields.length} Optional
          </span>
        </div>
      </div>

      {/* Required Fields */}
      {requiredFields.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-quikle-charcoal">Required Information</h3>
            <Badge variant="destructive" className="text-xs">Must Complete</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requiredFields
              .sort((a, b) => a.display_order - b.display_order)
              .map((field) => (
                <div 
                  key={field.id}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    values[field.id]?.trim() 
                      ? 'border-green-300 bg-green-50/50' 
                      : 'border-red-200 bg-red-50/30'
                  }`}
                >
                  <CustomFieldRenderer
                    field={field}
                    value={values[field.id] || ''}
                    onChange={(value) => onUpdateField(field.id, value)}
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
            <h3 className="font-medium text-quikle-charcoal">Additional Information</h3>
            <Badge variant="secondary" className="text-xs">Optional</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {optionalFields
              .sort((a, b) => a.display_order - b.display_order)
              .map((field) => (
                <div 
                  key={field.id}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    values[field.id]?.trim() 
                      ? 'border-quikle-primary/30 bg-quikle-crystal/30' 
                      : 'border-quikle-silver/30 bg-white'
                  }`}
                >
                  <CustomFieldRenderer
                    field={field}
                    value={values[field.id] || ''}
                    onChange={(value) => onUpdateField(field.id, value)}
                  />
                </div>
              ))}
          </div>
        </div>
      )}

      {fields.length === 0 && (
        <div className="text-center py-8 text-quikle-slate">
          <p>No fields defined for this template.</p>
        </div>
      )}
    </div>
  );
};

export default TemplateFieldsStep;
