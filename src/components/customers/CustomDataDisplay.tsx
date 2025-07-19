
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCustomerCustomData } from '@/hooks/useCustomerCustomData';
import { CustomerCustomData, TemplateField, IndustryTemplate } from '@/types/templates';
import { Loader2, FileText, AlertCircle } from 'lucide-react';

interface CustomDataDisplayProps {
  customerId: string;
}

const CustomDataDisplay = ({ customerId }: CustomDataDisplayProps) => {
  const { customData, templateFields, appliedTemplates, loading } = useCustomerCustomData(customerId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-quikle-primary" />
        <span className="ml-2 text-quikle-slate">Loading custom data...</span>
      </div>
    );
  }

  if (appliedTemplates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <FileText className="h-12 w-12 text-quikle-neutral/50 mb-3" />
        <p className="text-quikle-slate text-sm">No templates applied to this customer</p>
      </div>
    );
  }

  const getFieldValue = (fieldId: string): string => {
    const data = customData.find(cd => cd.field_id === fieldId);
    return data?.field_value || '';
  };

  const formatFieldValue = (field: TemplateField, value: string): string => {
    if (!value) return 'Not provided';
    
    switch (field.field_type) {
      case 'select':
        return value;
      case 'number':
        return value;
      case 'date':
        try {
          return new Date(value).toLocaleDateString();
        } catch {
          return value;
        }
      case 'email':
        return value;
      case 'phone':
        return value;
      default:
        return value;
    }
  };

  return (
    <div className="space-y-6">
      {appliedTemplates.map((template, templateIndex) => {
        const templateFieldsForTemplate = templateFields.filter(f => f.template_id === template.id);
        
        if (templateFieldsForTemplate.length === 0) return null;

        return (
          <Card key={template.id} className="bg-gradient-to-br from-white to-quikle-crystal/30 border-quikle-silver/30">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-quikle-primary">
                  {template.name}
                </CardTitle>
                <Badge variant="secondary" className="bg-quikle-primary/10 text-quikle-primary">
                  {template.industry}
                </Badge>
              </div>
              {template.description && (
                <p className="text-sm text-quikle-slate mt-1">{template.description}</p>
              )}
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templateFieldsForTemplate
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((field) => {
                    const value = getFieldValue(field.id);
                    const formattedValue = formatFieldValue(field, value);
                    const isEmpty = !value || value.trim() === '';
                    
                    return (
                      <div key={field.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-quikle-charcoal">
                            {field.field_label}
                          </label>
                          {field.is_required && (
                            <span className="text-red-500 text-xs">*</span>
                          )}
                          {isEmpty && field.is_required && (
                            <AlertCircle className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                        <div className={`text-sm p-2 rounded border ${
                          isEmpty 
                            ? 'bg-red-50 border-red-200 text-red-600' 
                            : 'bg-quikle-crystal/50 border-quikle-silver/20 text-quikle-charcoal'
                        }`}>
                          {formattedValue}
                        </div>
                      </div>
                    );
                  })}
              </div>
              
              {templateIndex < appliedTemplates.length - 1 && (
                <Separator className="mt-6" />
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CustomDataDisplay;
