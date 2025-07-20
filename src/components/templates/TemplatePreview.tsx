
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IndustryTemplate, TemplateField } from '@/types/templates';
import { Eye, FileText, CheckCircle } from 'lucide-react';

interface TemplatePreviewProps {
  template: IndustryTemplate;
  fields: TemplateField[];
  loading?: boolean;
}

const getFieldTypeIcon = (fieldType: string) => {
  switch (fieldType) {
    case 'text':
    case 'textarea':
      return '📝';
    case 'email':
      return '📧';
    case 'phone':
      return '📞';
    case 'number':
      return '🔢';
    case 'date':
      return '📅';
    case 'select':
      return '📋';
    case 'checkbox':
      return '☑️';
    default:
      return '📄';
  }
};

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  fields,
  loading = false
}) => {
  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-quikle-crystal/30 to-quikle-platinum/30 border-quikle-primary/20 animate-pulse">
        <CardHeader>
          <div className="h-4 bg-quikle-silver/30 rounded w-3/4"></div>
          <div className="h-3 bg-quikle-silver/20 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-quikle-silver/20 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const requiredFields = fields.filter(f => f.is_required);
  const optionalFields = fields.filter(f => !f.is_required);

  return (
    <Card className="bg-gradient-to-br from-quikle-crystal/30 to-quikle-platinum/30 border-quikle-primary/20 shadow-md animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-quikle-primary/10 to-quikle-secondary/10 rounded-lg">
            <Eye className="h-4 w-4 text-quikle-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg text-quikle-primary">
              {template.name} Preview
            </CardTitle>
            <p className="text-sm text-quikle-slate mt-1">
              {template.description || `Preview of ${template.industry} template fields`}
            </p>
          </div>
          <Badge variant="secondary" className="bg-quikle-primary/10 text-quikle-primary">
            {fields.length} field{fields.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {fields.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-center">
            <FileText className="h-8 w-8 text-quikle-neutral/50 mb-2" />
            <p className="text-quikle-slate text-sm">No custom fields in this template</p>
          </div>
        ) : (
          <>
            {requiredFields.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-quikle-charcoal">Required Fields</h4>
                  <Badge variant="secondary" className="bg-red-50 text-red-600 text-xs">
                    {requiredFields.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {requiredFields
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((field) => (
                      <div
                        key={field.id}
                        className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border border-red-200/50"
                      >
                        <span className="text-lg">{getFieldTypeIcon(field.field_type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-quikle-charcoal">
                              {field.field_label}
                            </span>
                            <span className="text-red-500 text-xs">*</span>
                          </div>
                          <span className="text-xs text-quikle-slate capitalize">
                            {field.field_type}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {optionalFields.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-quikle-charcoal">Optional Fields</h4>
                  <Badge variant="secondary" className="bg-quikle-primary/10 text-quikle-primary text-xs">
                    {optionalFields.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {optionalFields
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((field) => (
                      <div
                        key={field.id}
                        className="flex items-center gap-3 p-3 bg-white/30 rounded-lg border border-quikle-silver/30"
                      >
                        <span className="text-lg">{getFieldTypeIcon(field.field_type)}</span>
                        <div className="flex-1">
                          <span className="text-sm font-medium text-quikle-charcoal">
                            {field.field_label}
                          </span>
                          <br />
                          <span className="text-xs text-quikle-slate capitalize">
                            {field.field_type}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200/50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700">
                These fields will be added to your customer form when you select this template
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TemplatePreview;
