
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Building, MapPin, Phone, Mail, Edit3, Save } from 'lucide-react';
import { useCustomerCustomData } from '@/hooks/useCustomerCustomData';
import { useState } from 'react';

interface CustomDataDisplayProps {
  customerId: string;
}

const CustomDataDisplay = ({ customerId }: CustomDataDisplayProps) => {
  const { customData, templateFields, appliedTemplates, loading } = useCustomerCustomData(customerId);
  const [editMode, setEditMode] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const getFieldValue = (fieldId: string): string => {
    const data = customData.find(cd => cd.field_id === fieldId);
    return data?.field_value || '';
  };

  const handleEdit = () => {
    const values: Record<string, string> = {};
    templateFields.forEach(field => {
      values[field.id] = getFieldValue(field.id);
    });
    setEditValues(values);
    setEditMode(true);
  };

  const handleSave = () => {
    // In a real implementation, save the changes to the backend
    setEditMode(false);
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
      case 'email':
        return value;
      case 'phone':
        return value;
      case 'currency':
        return new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD' 
        }).format(parseFloat(value) || 0);
      default:
        return value;
    }
  };

  const getFieldIcon = (fieldType: string) => {
    switch (fieldType) {
      case 'email': return <Mail className="h-4 w-4 text-quikle-primary" />;
      case 'phone': return <Phone className="h-4 w-4 text-quikle-primary" />;
      case 'address': return <MapPin className="h-4 w-4 text-quikle-primary" />;
      default: return <Building className="h-4 w-4 text-quikle-primary" />;
    }
  };

  // Group fields by category
  const businessFields = templateFields.filter(field => 
    ['company_name', 'business_type', 'industry', 'tax_id', 'registration_number'].includes(field.field_name)
  );
  
  const contactFields = templateFields.filter(field =>
    ['address', 'city', 'state', 'zip_code', 'country', 'secondary_phone', 'website'].includes(field.field_name)
  );
  
  const otherFields = templateFields.filter(field =>
    !businessFields.includes(field) && !contactFields.includes(field)
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-quikle-silver/30 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-quikle-silver/20 rounded w-full"></div>
                <div className="h-3 bg-quikle-silver/20 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const renderFieldSection = (fields: any[], title: string, icon: React.ReactNode) => {
    if (fields.length === 0) return null;

    return (
      <Card className="bg-gradient-to-br from-white to-quikle-crystal/30 border-quikle-silver/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-quikle-charcoal">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(field => {
              const value = getFieldValue(field.id);
              const formattedValue = formatFieldValue(field, value);
              
              return (
                <div key={field.id} className="space-y-2">
                  <Label className="text-sm font-medium text-quikle-slate flex items-center gap-2">
                    {getFieldIcon(field.field_type)}
                    {field.field_label}
                    {field.is_required && <span className="text-red-500">*</span>}
                  </Label>
                  {editMode ? (
                    <Input
                      value={editValues[field.id] || ''}
                      onChange={(e) => setEditValues(prev => ({
                        ...prev,
                        [field.id]: e.target.value
                      }))}
                      placeholder={`Enter ${field.field_label.toLowerCase()}`}
                      className="border-quikle-silver/50 focus:border-quikle-primary"
                    />
                  ) : (
                    <div className={`p-3 rounded-md border ${
                      value ? 'bg-white border-quikle-silver/30' : 'bg-quikle-crystal/50 border-dashed border-quikle-silver/50'
                    }`}>
                      <span className={value ? 'text-quikle-charcoal' : 'text-quikle-slate italic'}>
                        {formattedValue}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-quikle-charcoal">Custom Information</h3>
          <p className="text-sm text-quikle-slate">Industry-specific and custom fields</p>
        </div>
        <Button
          onClick={editMode ? handleSave : handleEdit}
          className={editMode 
            ? "bg-gradient-to-r from-quikle-success to-green-600 text-white"
            : "bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white"
          }
          size="sm"
        >
          {editMode ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          ) : (
            <>
              <Edit3 className="mr-2 h-4 w-4" />
              Edit
            </>
          )}
        </Button>
      </div>

      {/* Applied Templates */}
      {appliedTemplates.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {appliedTemplates.map(template => (
            <Badge 
              key={template.id} 
              variant="secondary" 
              className="bg-quikle-primary/10 text-quikle-primary border border-quikle-primary/20"
            >
              {template.industry} Template
            </Badge>
          ))}
        </div>
      )}

      {/* Business Information */}
      {renderFieldSection(
        businessFields,
        "Business Information",
        <Building className="h-5 w-5 text-quikle-primary" />
      )}

      {/* Contact & Address Information */}
      {renderFieldSection(
        contactFields,
        "Contact & Address Information",
        <MapPin className="h-5 w-5 text-quikle-secondary" />
      )}

      {/* Additional Information */}
      {renderFieldSection(
        otherFields,
        "Additional Information",
        <Building className="h-5 w-5 text-quikle-accent" />
      )}

      {appliedTemplates.length === 0 && (
        <Card className="bg-gradient-to-br from-quikle-crystal/50 to-white border-dashed border-quikle-silver/50">
          <CardContent className="py-8 text-center">
            <Building className="h-16 w-16 text-quikle-neutral/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-quikle-charcoal mb-2">No Custom Templates Applied</h3>
            <p className="text-quikle-slate mb-4">
              This customer doesn't have any industry-specific templates applied yet.
            </p>
            <p className="text-sm text-quikle-slate">
              Templates can be applied during the onboarding process or by editing the customer's profile.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomDataDisplay;
