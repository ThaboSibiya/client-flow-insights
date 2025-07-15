
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCustomerTemplates } from '@/hooks/useCustomerTemplates';
import CustomFieldsDisplay from '@/components/templates/CustomFieldsDisplay';
import { User, Building, Mail, Phone, MapPin, FileText } from 'lucide-react';

interface TicketCustomerContextProps {
  customerId: string;
  customerName?: string;
  customerEmail?: string;
}

const TicketCustomerContext: React.FC<TicketCustomerContextProps> = ({
  customerId,
  customerName,
  customerEmail
}) => {
  const { enhancedCustomer, loading } = useCustomerTemplates(customerId);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-4">
          <div className="animate-pulse text-sm">Loading customer context...</div>
        </CardContent>
      </Card>
    );
  }

  if (!enhancedCustomer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Customer data not available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Basic Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{enhancedCustomer.name}</span>
          </div>
          
          {enhancedCustomer.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{enhancedCustomer.email}</span>
            </div>
          )}
          
          {enhancedCustomer.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{enhancedCustomer.phone}</span>
            </div>
          )}
          
          {enhancedCustomer.address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{enhancedCustomer.address}</span>
            </div>
          )}

          {enhancedCustomer.contact_person && (
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-xs text-gray-500">Contact Person</div>
                <span className="text-sm">{enhancedCustomer.contact_person}</span>
              </div>
            </div>
          )}

          {enhancedCustomer.status && (
            <div className="pt-2">
              <Badge variant="secondary">{enhancedCustomer.status}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Applied Templates */}
      {enhancedCustomer.applied_templates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Industry Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {enhancedCustomer.applied_templates.map((template) => (
                <Badge key={template.id} variant="outline">
                  {template.name}
                </Badge>
              ))}
            </div>
            
            {enhancedCustomer.custom_fields.length > 0 && (
              <>
                <Separator className="my-4" />
                <CustomFieldsDisplay
                  customFields={enhancedCustomer.custom_fields}
                  title=""
                  showEmpty={false}
                />
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {enhancedCustomer.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {enhancedCustomer.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TicketCustomerContext;
