
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Building, Phone, Mail } from 'lucide-react';
import { useCustomerCustomData } from '@/hooks/useCustomerCustomData';

interface CustomerContextCardProps {
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  compact?: boolean;
}

const CustomerContextCard = ({ 
  customerId, 
  customerName, 
  customerEmail, 
  customerPhone,
  compact = false 
}: CustomerContextCardProps) => {
  const { customData, templateFields, appliedTemplates, loading } = useCustomerCustomData(customerId);

  const getFieldValue = (fieldId: string): string => {
    const data = customData.find(cd => cd.field_id === fieldId);
    return data?.field_value || '';
  };

  const formatFieldValue = (field: any, value: string): string => {
    if (!value) return 'Not provided';
    
    switch (field.field_type) {
      case 'date':
        try {
          return new Date(value).toLocaleDateString();
        } catch {
          return value;
        }
      default:
        return value;
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get the most important custom fields (first 3-4 fields from applied templates)
  const importantFields = templateFields
    .filter(field => {
      const value = getFieldValue(field.id);
      return value && value.trim() !== '';
    })
    .sort((a, b) => a.display_order - b.display_order)
    .slice(0, compact ? 2 : 4);

  return (
    <Card className="w-full bg-gradient-to-br from-white to-blue-50/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <User className="h-4 w-4 text-blue-600" />
          Customer Context
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Basic Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Building className="h-3 w-3 text-gray-500" />
            {customerName}
          </div>
          {customerEmail && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Mail className="h-3 w-3" />
              {customerEmail}
            </div>
          )}
          {customerPhone && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Phone className="h-3 w-3" />
              {customerPhone}
            </div>
          )}
        </div>

        {/* Applied Templates */}
        {appliedTemplates.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {appliedTemplates.map(template => (
              <Badge key={template.id} variant="secondary" className="text-xs">
                {template.industry}
              </Badge>
            ))}
          </div>
        )}

        {/* Important Custom Fields */}
        {importantFields.length > 0 && (
          <div className="space-y-2">
            {importantFields.map(field => {
              const value = getFieldValue(field.id);
              const formattedValue = formatFieldValue(field, value);
              
              return (
                <div key={field.id} className="text-xs">
                  <span className="font-medium text-gray-700">{field.field_label}:</span>
                  <span className="ml-1 text-gray-600">{formattedValue}</span>
                </div>
              );
            })}
          </div>
        )}

        {appliedTemplates.length === 0 && (
          <p className="text-xs text-gray-500 italic">No custom data templates applied</p>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerContextCard;
