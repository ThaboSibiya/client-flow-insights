import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IndustryTemplate, TemplateField } from '@/types/templates';
import { 
  User, 
  Mail, 
  Phone, 
  Tag, 
  FileText, 
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { CustomerStatus } from '@/context/CRMContext';

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  notes: string;
}

interface ReviewStepProps {
  customerData: CustomerData;
  template: IndustryTemplate | null;
  templateFields: TemplateField[];
  customFieldValues: Record<string, string>;
}

const STATUS_CONFIG: Record<CustomerStatus, { label: string; color: string }> = {
  new: { label: 'New Customer', color: 'bg-blue-500' },
  existing: { label: 'Existing Customer', color: 'bg-green-500' },
  pending: { label: 'Pending Policy', color: 'bg-yellow-500' },
  finalised: { label: 'Finalised Sale', color: 'bg-purple-500' },
};

const ReviewStep: React.FC<ReviewStepProps> = ({
  customerData,
  template,
  templateFields,
  customFieldValues,
}) => {
  const statusConfig = STATUS_CONFIG[customerData.status];
  const filledFields = templateFields.filter(f => customFieldValues[f.id]?.trim());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-quikle-charcoal mb-2">
          Review & Confirm
        </h2>
        <p className="text-quikle-slate">
          Please verify the information before adding this customer
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* Basic Info Card */}
        <Card className="border-quikle-silver/30 shadow-sm">
          <CardContent className="p-5">
            <h3 className="font-medium text-quikle-charcoal mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-quikle-primary" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-quikle-slate uppercase tracking-wide">Name</p>
                <p className="font-medium text-quikle-charcoal">{customerData.name}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-quikle-slate uppercase tracking-wide">Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${statusConfig.color}`} />
                  <span className="font-medium text-quikle-charcoal">{statusConfig.label}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-quikle-slate uppercase tracking-wide flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </p>
                <p className="font-medium text-quikle-charcoal">{customerData.email}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-quikle-slate uppercase tracking-wide flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Phone
                </p>
                <p className="font-medium text-quikle-charcoal">{customerData.phone}</p>
              </div>
              
              {customerData.notes && (
                <div className="col-span-full space-y-1">
                  <p className="text-xs text-quikle-slate uppercase tracking-wide flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Notes
                  </p>
                  <p className="text-sm text-quikle-charcoal">{customerData.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Template Info Card */}
        {template && (
          <Card className="border-quikle-silver/30 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-quikle-charcoal flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-quikle-secondary" />
                  {template.name} Template
                </h3>
                <Badge variant="secondary" className="bg-quikle-primary/10 text-quikle-primary">
                  {filledFields.length}/{templateFields.length} fields
                </Badge>
              </div>
              
              {filledFields.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filledFields.map((field) => (
                    <div key={field.id} className="space-y-1 p-2 bg-quikle-crystal/30 rounded-lg">
                      <p className="text-xs text-quikle-slate uppercase tracking-wide">
                        {field.field_label}
                        {field.is_required && <span className="text-red-500 ml-1">*</span>}
                      </p>
                      <p className="text-sm font-medium text-quikle-charcoal">
                        {customFieldValues[field.id]}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-quikle-slate">No template fields filled.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* No Template Notice */}
        {!template && (
          <div className="text-center py-4 px-6 bg-quikle-crystal/30 rounded-lg">
            <p className="text-sm text-quikle-slate">
              No industry template selected. Using basic customer fields only.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewStep;
