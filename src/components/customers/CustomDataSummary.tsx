
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useCustomerCustomData } from '@/hooks/useCustomerCustomData';

interface CustomDataSummaryProps {
  customerId: string;
  compact?: boolean;
}

const CustomDataSummary = ({ customerId, compact = false }: CustomDataSummaryProps) => {
  const { customData, templateFields, appliedTemplates, loading } = useCustomerCustomData(customerId);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-quikle-crystal rounded w-20 mb-2"></div>
        <div className="h-3 bg-quikle-crystal rounded w-16"></div>
      </div>
    );
  }

  if (appliedTemplates.length === 0) {
    return compact ? (
      <Badge variant="outline" className="text-xs text-quikle-neutral border-quikle-neutral/30">
        No templates
      </Badge>
    ) : (
      <div className="text-center py-4">
        <FileText className="h-8 w-8 text-quikle-neutral/50 mx-auto mb-2" />
        <p className="text-sm text-quikle-slate">No custom templates applied</p>
      </div>
    );
  }

  const getFieldValue = (fieldId: string): string => {
    const data = customData.find(cd => cd.field_id === fieldId);
    return data?.field_value || '';
  };

  // Calculate completion stats
  const totalFields = templateFields.length;
  const completedFields = templateFields.filter(field => {
    const value = getFieldValue(field.id);
    return value && value.trim() !== '';
  }).length;
  
  const requiredFields = templateFields.filter(field => field.is_required).length;
  const completedRequiredFields = templateFields.filter(field => {
    if (!field.is_required) return true;
    const value = getFieldValue(field.id);
    return value && value.trim() !== '';
  }).length;

  const completionPercentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  const isComplete = requiredFields === completedRequiredFields;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="bg-quikle-primary/10 text-quikle-primary">
          {appliedTemplates.length} template{appliedTemplates.length !== 1 ? 's' : ''}
        </Badge>
        <div className="flex items-center gap-1">
          {isComplete ? (
            <CheckCircle className="h-3 w-3 text-green-500" />
          ) : (
            <AlertCircle className="h-3 w-3 text-amber-500" />
          )}
          <span className="text-xs text-quikle-slate">{completionPercentage}%</span>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white to-quikle-crystal/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-quikle-primary" />
            Custom Data Summary
          </span>
          {isComplete ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-amber-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Applied Templates */}
        <div>
          <p className="text-xs font-medium text-quikle-slate mb-1">Applied Templates:</p>
          <div className="flex flex-wrap gap-1">
            {appliedTemplates.map(template => (
              <Badge key={template.id} variant="outline" className="text-xs border-quikle-primary/30 text-quikle-primary">
                {template.industry}
              </Badge>
            ))}
          </div>
        </div>

        {/* Completion Stats */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-quikle-slate">Completion</span>
            <span className="text-quikle-charcoal font-medium">{completedFields}/{totalFields} fields</span>
          </div>
          <div className="w-full bg-quikle-crystal rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-quikle-primary to-quikle-secondary h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          {requiredFields > 0 && (
            <p className="text-xs text-quikle-slate">
              {completedRequiredFields}/{requiredFields} required fields completed
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomDataSummary;
