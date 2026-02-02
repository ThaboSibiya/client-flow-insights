
import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Customer } from '@/types/customer';
import CustomerDetailsForm from './CustomerDetailsForm';
import BusinessInformationForm from './BusinessInformationForm';
import EquipmentManager from '../equipment/EquipmentManager';
import { User, Briefcase, Printer, AlertCircle, CheckCircle } from 'lucide-react';
import { useCustomerCustomData } from '@/hooks/useCustomerCustomData';
import { cn } from '@/lib/utils';

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

  // Reset tab when dialog closes
  React.useEffect(() => {
    if (!isOpen) {
      setActiveTab('details');
    }
  }, [isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-lg p-0 flex flex-col bg-gradient-to-b from-white to-quikle-crystal/20"
      >
        <SheetDescription className="sr-only">
          View and edit customer details, business information, and equipment
        </SheetDescription>
        
        {/* Header */}
        <SheetHeader className="border-b border-quikle-silver/20 p-4 sm:p-6 flex-shrink-0">
          <div className="pr-8">
            <SheetTitle className="text-xl font-semibold text-quikle-charcoal truncate">
              {customer?.name || 'Customer Details'}
            </SheetTitle>
            {customer?.email && (
              <p className="text-sm text-quikle-slate mt-0.5 truncate">{customer.email}</p>
            )}
            {customer && !loading && appliedTemplates.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                {appliedTemplates.map(template => (
                  <Badge 
                    key={template.id} 
                    variant="secondary" 
                    className="bg-quikle-primary/10 text-quikle-primary text-xs"
                  >
                    {template.industry || 'Template'}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </SheetHeader>
        
        {customer && (
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Compact Tab List */}
            <TabsList className="flex w-full bg-quikle-crystal/50 border-b border-quikle-silver/20 rounded-none p-1 gap-1 flex-shrink-0">
              <TabsTrigger 
                value="details" 
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md transition-all",
                  "data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-quikle-primary"
                )}
              >
                <User className="h-3.5 w-3.5" />
                <span>Personal</span>
              </TabsTrigger>
              <TabsTrigger 
                value="business" 
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md transition-all",
                  "data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-quikle-primary"
                )}
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span>Business</span>
                {!loading && appliedTemplates.length > 0 && (
                  <>
                    {hasIncompleteRequired ? (
                      <AlertCircle className="h-3 w-3 text-amber-500" />
                    ) : requiredFields.length > 0 ? (
                      <CheckCircle className="h-3 w-3 text-emerald-500" />
                    ) : null}
                  </>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="equipment" 
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md transition-all",
                  "data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-quikle-primary"
                )}
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Equipment</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              <TabsContent value="details" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 sm:p-6">
                    <CustomerDetailsForm 
                      customer={customer}
                      onClose={onClose}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="business" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 sm:p-6">
                    <BusinessInformationForm 
                      customer={customer}
                      onClose={onClose}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="equipment" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 sm:p-6">
                    <EquipmentManager customerId={customer.id} />
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CustomerDetailsDialog;
