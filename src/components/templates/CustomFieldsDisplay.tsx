
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CustomFieldValue } from '@/types/customData';
import { CalendarDays, Mail, Phone, Hash, FileText, CheckCircle, XCircle } from 'lucide-react';

interface CustomFieldsDisplayProps {
  customFields: CustomFieldValue[];
  title?: string;
  showEmpty?: boolean;
}

const CustomFieldsDisplay: React.FC<CustomFieldsDisplayProps> = ({
  customFields,
  title = "Custom Information",
  showEmpty = false
}) => {
  const getFieldIcon = (fieldType: string) => {
    switch (fieldType) {
      case 'email': return Mail;
      case 'phone': return Phone;
      case 'date': return CalendarDays;
      case 'number': return Hash;
      case 'textarea': return FileText;
      case 'boolean': return CheckCircle;
      default: return FileText;
    }
  };

  const formatFieldValue = (field: CustomFieldValue) => {
    if (!field.field_value) return showEmpty ? 'Not provided' : null;

    switch (field.field_type) {
      case 'boolean':
        return field.field_value === 'true' ? 'Yes' : 'No';
      case 'date':
        try {
          return new Date(field.field_value).toLocaleDateString();
        } catch {
          return field.field_value;
        }
      case 'number':
        return Number(field.field_value).toLocaleString();
      default:
        return field.field_value;
    }
  };

  const getBooleanIcon = (value: string) => {
    return value === 'true' ? CheckCircle : XCircle;
  };

  const fieldsToShow = showEmpty 
    ? customFields 
    : customFields.filter(field => field.field_value);

  if (fieldsToShow.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fieldsToShow.map((field, index) => {
            const Icon = field.field_type === 'boolean' && field.field_value 
              ? getBooleanIcon(field.field_value)
              : getFieldIcon(field.field_type);
            
            const formattedValue = formatFieldValue(field);
            
            if (!formattedValue && !showEmpty) return null;

            return (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                <Icon className={`h-4 w-4 mt-0.5 ${
                  field.field_type === 'boolean' 
                    ? field.field_value === 'true' ? 'text-green-600' : 'text-red-600'
                    : 'text-gray-600'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {field.field_label}
                    </span>
                    {field.is_required && (
                      <Badge variant="secondary" className="text-xs">Required</Badge>
                    )}
                  </div>
                  <span className={`text-sm ${
                    formattedValue === 'Not provided' ? 'text-gray-400 italic' : 'text-gray-700'
                  }`}>
                    {formattedValue}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomFieldsDisplay;
