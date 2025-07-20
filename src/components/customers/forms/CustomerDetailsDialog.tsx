
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Customer } from '@/types/customer';
import CustomerDetailsForm from './CustomerDetailsForm';
import CustomDataDisplay from '../CustomDataDisplay';
import { FileText, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useCustomerCustomData } from '@/hooks/useCustomerCustomData';

interface CustomerDetailsDialogProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

const CustomerDetailsDialog = ({ customer, isOpen, onClose }: CustomerDetailsDialogProps) => {
  const [activeTab, setActiveTab] = useState('details');
  const { appliedTemplates, templateFields, customData, loading } = useCustomerCustomData(customer?.id || '');

  // Calculate completion stats for the tab indicator
  const getFieldValue = (fieldId: string): string => {
    const data = customData.find(cd => cd.field_id === fieldId);
    return data?.field_value || '';
  };

  const requiredFields = templateFields.filter(field => field.is_required);
  const completedRequiredFields = requiredFields.filter(field => {
    const value = getFieldValue(field.id);
    return value && value.trim() !== '';
  });
  const hasIncompleteRequired = requiredFields.length > completedRequiredFields.length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] bg-gradient-to-br from-white via-quikle-crystal to-quikle-platinum border-quikle-silver/30 shadow-luxury">
        <DialogHeader className="border-b border-quikle-silver/20 pb-4">
          <DialogTitle className="text-2xl bg-gradient-to-r from-quikle-primary to-quikle-secondary bg-clip-text text-transparent">
            {customer ? `${customer.name}` : 'Customer Details'}
          </DialogTitle>
          {customer && !loading && appliedTemplates.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-quikle-slate">Applied Templates:</span>
              {appliedTemplates.map(template => (
                <Badge key={template.id} variant="secondary" className="bg-quikle-primary/10 text-quikle-primary text-xs">
                  {template.industry}
                </Badge>
              ))}
            </div>
          )}
        </DialogHeader>
        
        {customer && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-quikle-crystal to-quikle-platinum border border-quikle-silver/30">
              <TabsTrigger 
                value="details" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-quikle-primary data-[state=active]:to-quikle-secondary data-[state=active]:text-white"
              >
                <User className="h-4 w-4" />
                Customer Details
              </TabsTrigger>
              <TabsTrigger 
                value="custom-data" 
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-quikle-primary data-[state=active]:to-quikle-secondary data-[state=active]:text-white"
              >
                <FileText className="h-4 w-4" />
                Custom Information
                {!loading && appliedTemplates.length > 0 && (
                  <>
                    <Badge variant="secondary" className="bg-white/20 text-white text-xs ml-1">
                      {appliedTemplates.length}
                    </Badge>
                    {hasIncompleteRequired && (
                      <AlertCircle className="h-3 w-3 text-amber-300" />
                    )}
                    {!hasIncompleteRequired && requiredFields.length > 0 && (
                      <CheckCircle className="h-3 w-3 text-green-300" />
                    )}
                  </>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6 max-h-[60vh] overflow-y-auto">
              <CustomerDetailsForm 
                customer={customer}
                onClose={onClose}
              />
            </TabsContent>
            
            <TabsContent value="custom-data" className="mt-6 max-h-[60vh] overflow-y-auto">
              {!loading && appliedTemplates.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 text-quikle-neutral/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-quikle-charcoal mb-2">No Custom Templates Applied</h3>
                  <p className="text-quikle-slate mb-4">This customer doesn't have any industry-specific templates applied yet.</p>
                  <p className="text-sm text-quikle-slate">Templates can be applied during the onboarding process or by editing the customer's profile.</p>
                </div>
              )}
              {appliedTemplates.length > 0 && (
                <div className="space-y-4">
                  {hasIncompleteRequired && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 text-amber-800">
                        <AlertCircle className="h-4 w-4" />
                        <span className="font-medium">Incomplete Required Fields</span>
                      </div>
                      <p className="text-sm text-amber-700 mt-1">
                        Some required fields are missing information. Please complete them for better service delivery.
                      </p>
                    </div>
                  )}
                  <CustomDataDisplay customerId={customer.id} />
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsDialog;
