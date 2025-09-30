
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  User, 
  Edit3, 
  Save, 
  X, 
  AlertCircle,
  CheckCircle,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { useCustomerCustomData } from '@/hooks/useCustomerCustomData';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import CustomFieldManager from './CustomFieldManager';

interface CustomDataDisplayProps {
  customerId: string;
}

const CustomDataDisplay = ({ customerId }: CustomDataDisplayProps) => {
  const { user } = useAuth();
  const { 
    appliedTemplates, 
    templateFields, 
    customData, 
    loading, 
    saveCustomData,
    refreshData 
  } = useCustomerCustomData(customerId);
  
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  const getFieldValue = (fieldId: string): string => {
    const data = customData.find(cd => cd.field_id === fieldId);
    return data?.field_value || '';
  };

  const handleStartEdit = (fieldId: string, currentValue: string) => {
    setEditingField(fieldId);
    setEditValue(currentValue);
  };

  const handleSave = async (fieldId: string) => {
    setSaving(true);
    try {
      const success = await saveCustomData(fieldId, editValue);
      if (success) {
        setEditingField(null);
        setEditValue('');
        toast({
          title: "Success",
          description: "Field updated successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save field",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const renderFieldInput = (field: any) => {
    const isEditing = editingField === field.id;
    const currentValue = isEditing ? editValue : getFieldValue(field.id);

    if (!isEditing) {
      return (
        <div className="flex items-center justify-between group">
          <span className="text-quikle-charcoal">
            {currentValue || <em className="text-quikle-slate">Not provided</em>}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleStartEdit(field.id, currentValue)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit3 className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    const commonProps = {
      value: editValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        setEditValue(e.target.value),
      className: "border-quikle-silver/50 focus:border-quikle-primary"
    };

    let input;
    switch (field.field_type) {
      case 'textarea':
        input = <Textarea {...commonProps} rows={3} />;
        break;
      case 'select':
        input = (
          <Select value={editValue} onValueChange={setEditValue}>
            <SelectTrigger className="border-quikle-silver/50 focus:border-quikle-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(field.field_options?.options || []).map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        break;
      default:
        input = <Input {...commonProps} type={field.field_type === 'email' ? 'email' : 'text'} />;
    }

    return (
      <div className="space-y-2">
        {input}
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            disabled={saving}
          >
            <X className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            onClick={() => handleSave(field.id)}
            disabled={saving}
            className="bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white"
          >
            <Save className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };

  const getFieldIcon = (fieldName: string) => {
    const name = fieldName.toLowerCase();
    if (name.includes('phone')) return <Phone className="h-4 w-4" />;
    if (name.includes('email')) return <Mail className="h-4 w-4" />;
    if (name.includes('address') || name.includes('location')) return <MapPin className="h-4 w-4" />;
    if (name.includes('company') || name.includes('business')) return <Building2 className="h-4 w-4" />;
    return <User className="h-4 w-4" />;
  };

  // Separate fields by category
  const personalFields = templateFields.filter(field => field.category === 'personal');
  const businessFields = templateFields.filter(field => field.category === 'business');

  // Calculate completion stats
  const requiredPersonalFields = personalFields.filter(field => field.is_required);
  const completedPersonalFields = requiredPersonalFields.filter(field => {
    const value = getFieldValue(field.id);
    return value && value.trim() !== '';
  });

  const requiredBusinessFields = businessFields.filter(field => field.is_required);
  const completedBusinessFields = requiredBusinessFields.filter(field => {
    const value = getFieldValue(field.id);
    return value && value.trim() !== '';
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
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

  // Show custom field manager when no templates or alongside templates
  const showCustomFieldManager = user && templateFields.length === 0;

  if (loading) {
    return null; // Loading already handled above
  }

  if (templateFields.length === 0 && customData.length === 0) {
    return (
      <div className="space-y-4">
        <Card className="bg-gradient-to-br from-quikle-crystal/50 to-white border-dashed border-quikle-silver/50">
          <CardContent className="py-8 text-center">
            <Building2 className="h-16 w-16 text-quikle-neutral/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-quikle-charcoal mb-2">No Business Information Yet</h3>
            <p className="text-quikle-slate mb-4">
              Add custom fields to store business information for this customer.
            </p>
          </CardContent>
        </Card>
        
        {user && (
          <CustomFieldManager 
            customerId={customerId}
            userId={user.id}
            onFieldAdded={refreshData}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-quikle-charcoal flex items-center gap-2">
            <Building2 className="h-5 w-5 text-quikle-primary" />
            Business Information
          </h3>
          {appliedTemplates.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              {appliedTemplates.map(template => (
                <Badge key={template.id} variant="secondary" className="bg-quikle-primary/10 text-quikle-primary">
                  {template.industry}
                </Badge>
              ))}
            </div>
          )}
        </div>
        {user && (
          <CustomFieldManager 
            customerId={customerId}
            userId={user.id}
            onFieldAdded={refreshData}
          />
        )}
      </div>

      {/* Company/Personal Information Section */}
      {personalFields.length > 0 && (
        <Card className="bg-gradient-to-br from-white to-quikle-crystal/30 border-quikle-silver/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-quikle-primary" />
                <CardTitle className="text-lg text-quikle-charcoal">
                  Company & Contact Information
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {requiredPersonalFields.length > 0 && (
                  completedPersonalFields.length === requiredPersonalFields.length ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {completedPersonalFields.length}/{requiredPersonalFields.length} Required
                    </Badge>
                  )
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {personalFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label className="flex items-center gap-2 text-quikle-slate font-medium">
                    {getFieldIcon(field.field_name)}
                    {field.field_label}
                    {field.is_required && <span className="text-red-500">*</span>}
                  </Label>
                  {renderFieldInput(field)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Information Section */}
      {businessFields.length > 0 && (
        <Card className="bg-gradient-to-br from-white to-quikle-crystal/30 border-quikle-silver/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-quikle-primary" />
                <CardTitle className="text-lg text-quikle-charcoal">
                  Business Details
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {requiredBusinessFields.length > 0 && (
                  completedBusinessFields.length === requiredBusinessFields.length ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {completedBusinessFields.length}/{requiredBusinessFields.length} Required
                    </Badge>
                  )
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {businessFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label className="flex items-center gap-2 text-quikle-slate font-medium">
                    {getFieldIcon(field.field_name)}
                    {field.field_label}
                    {field.is_required && <span className="text-red-500">*</span>}
                  </Label>
                  {renderFieldInput(field)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomDataDisplay;
