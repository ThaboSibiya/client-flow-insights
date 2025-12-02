
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Customer } from '@/types/customer';
import CustomerDetailsForm from './CustomerDetailsForm';
import BusinessInformationForm from './BusinessInformationForm';
import CustomDataDisplay from '../CustomDataDisplay';
import EquipmentDisplay from '../equipment/EquipmentDisplay';
import CustomerFinanceTab from '@/components/finance/CustomerFinanceTab';
import { FileText, User, AlertCircle, CheckCircle, Printer, DollarSign } from 'lucide-react';
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
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] p-0 bg-gradient-to-br from-white via-quikle-crystal to-quikle-platinum border-quikle-silver/30 shadow-luxury flex flex-col overflow-hidden">
        <DialogDescription className="sr-only">
          View and edit customer details, business information, and equipment
        </DialogDescription>
        <DialogHeader className="border-b border-quikle-silver/20 pb-4 px-3 sm:px-6 pt-4 sm:pt-6 flex-shrink-0">
          <DialogTitle className="text-lg sm:text-2xl bg-gradient-to-r from-quikle-primary to-quikle-secondary bg-clip-text text-transparent truncate">
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col overflow-hidden px-3 sm:px-6 pb-6">
            <TabsList className="flex w-full overflow-x-auto sm:overflow-x-visible bg-gradient-to-r from-quikle-crystal to-quikle-platinum border border-quikle-silver/30 mt-4 flex-shrink-0 gap-1 p-1">
              <TabsTrigger 
                value="details" 
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-quikle-primary data-[state=active]:to-quikle-secondary data-[state=active]:text-white"
              >
                <User className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Personal Details</span>
                <span className="sm:hidden">Personal</span>
              </TabsTrigger>
              <TabsTrigger 
                value="custom-data" 
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-quikle-primary data-[state=active]:to-quikle-secondary data-[state=active]:text-white"
              >
                <FileText className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Business Info</span>
                <span className="sm:hidden">Business</span>
                {!loading && appliedTemplates.length > 0 && (
                  <>
                    <Badge variant="secondary" className="bg-white/20 text-white text-[10px] sm:text-xs ml-1 flex-shrink-0">
                      {appliedTemplates.length}
                    </Badge>
                    {hasIncompleteRequired && (
                      <AlertCircle className="h-3 w-3 text-amber-300 flex-shrink-0" />
                    )}
                    {!hasIncompleteRequired && requiredFields.length > 0 && (
                      <CheckCircle className="h-3 w-3 text-green-300 flex-shrink-0" />
                    )}
                  </>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="equipment" 
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-quikle-primary data-[state=active]:to-quikle-secondary data-[state=active]:text-white"
              >
                <Printer className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Equipment</span>
                <span className="sm:hidden">Equip</span>
              </TabsTrigger>
              <TabsTrigger 
                value="finance" 
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap flex-shrink-0 data-[state=active]:bg-gradient-to-r data-[state=active]:from-quikle-primary data-[state=active]:to-quikle-secondary data-[state=active]:text-white"
              >
                <DollarSign className="h-4 w-4 flex-shrink-0" />
                Finance
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6 flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(90vh-280px)] pr-4">
                <CustomerDetailsForm 
                  customer={customer}
                  onClose={onClose}
                />
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="custom-data" className="mt-6 flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(90vh-280px)] pr-4">
                <BusinessInformationForm 
                  customer={customer}
                  onClose={onClose}
                />
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="equipment" className="mt-6 flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(90vh-280px)] pr-4">
                <EquipmentDisplay customerId={customer.id} />
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="finance" className="mt-6 flex-1 overflow-hidden">
              <ScrollArea className="h-[calc(90vh-280px)] pr-4">
                <CustomerFinanceTab customerId={customer.id} customerName={customer.name} />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsDialog;
