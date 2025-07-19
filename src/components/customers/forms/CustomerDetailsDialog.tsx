
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Customer } from '@/types/customer';
import CustomerDetailsForm from './CustomerDetailsForm';
import CustomDataDisplay from '../CustomDataDisplay';
import { FileText, User } from 'lucide-react';

interface CustomerDetailsDialogProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

const CustomerDetailsDialog = ({ customer, isOpen, onClose }: CustomerDetailsDialogProps) => {
  const [activeTab, setActiveTab] = useState('details');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] bg-gradient-to-br from-white via-quikle-crystal to-quikle-platinum border-quikle-silver/30 shadow-luxury">
        <DialogHeader className="border-b border-quikle-silver/20 pb-4">
          <DialogTitle className="text-2xl bg-gradient-to-r from-quikle-primary to-quikle-secondary bg-clip-text text-transparent">
            {customer ? `${customer.name}` : 'Customer Details'}
          </DialogTitle>
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
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-6 max-h-[60vh] overflow-y-auto">
              <CustomerDetailsForm 
                customer={customer}
                onClose={onClose}
              />
            </TabsContent>
            
            <TabsContent value="custom-data" className="mt-6 max-h-[60vh] overflow-y-auto">
              <CustomDataDisplay customerId={customer.id} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDetailsDialog;
