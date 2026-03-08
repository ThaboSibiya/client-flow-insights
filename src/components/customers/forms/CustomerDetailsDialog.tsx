import React, { useState, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Customer } from '@/types/customer';
import CustomerDetailsForm from './CustomerDetailsForm';
import BusinessInformationForm from './BusinessInformationForm';
import EquipmentManager from '../equipment/EquipmentManager';
import TicketsList from '../tickets/TicketsList';
import NewTicketForm from '../tickets/NewTicketForm';
import { User, Briefcase, Printer, Ticket, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { useCustomerCustomData } from '@/hooks/useCustomerCustomData';
import { useTicketManagement } from '@/hooks/useTicketManagement';
import { useTicketEvents } from '@/hooks/useTicketEvents';
import { cn } from '@/lib/utils';

interface CustomerDetailsDialogProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

const CustomerDetailsDialog = ({ customer, isOpen, onClose }: CustomerDetailsDialogProps) => {
  const [activeTab, setActiveTab] = useState('details');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { appliedTemplates, templateFields, customData, loading } = useCustomerCustomData(customer?.id || '');
  const { handleCreateTicket, handleUpdateTicketStatus, handleAddTimeEntry } = useTicketManagement();

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

  const handleRefresh = useCallback((data: any) => {
    if (!data?.customerId || data.customerId === customer?.id) {
      setRefreshKey(prev => prev + 1);
    }
  }, [customer?.id]);

  useTicketEvents({
    onCustomerTicketsRefresh: handleRefresh,
    onTicketCreated: handleRefresh,
    onTicketStatusChanged: handleRefresh,
  });

  const onCreateTicket = async (ticketData: any) => {
    if (customer) {
      const success = await handleCreateTicket(customer.id, ticketData);
      if (success) setShowNewTicketForm(false);
    }
  };

  const openTickets = customer?.activeTickets?.filter(
    t => t.status === 'open' || t.status === 'in-progress'
  ) || [];

  React.useEffect(() => {
    if (!isOpen) {
      setActiveTab('details');
      setShowNewTicketForm(false);
    }
  }, [isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-lg p-0 flex flex-col bg-background"
      >
        <SheetDescription className="sr-only">
          View and edit customer details, business information, equipment, and tickets
        </SheetDescription>
        
        {/* Header */}
        <SheetHeader className="border-b border-border px-5 py-4 flex-shrink-0">
          <div className="pr-8">
            <SheetTitle className="text-lg font-semibold text-foreground truncate">
              {customer?.name || 'Customer Details'}
            </SheetTitle>
            {customer?.email && (
              <p className="text-sm text-muted-foreground mt-0.5 truncate">{customer.email}</p>
            )}
            {customer && !loading && appliedTemplates.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                {appliedTemplates.map(template => (
                  <Badge 
                    key={template.id} 
                    variant="secondary" 
                    className="text-xs"
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
            <TabsList className="flex w-full bg-muted/50 border-b border-border rounded-none p-1 gap-1 flex-shrink-0">
              <TabsTrigger 
                value="details" 
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md transition-all",
                  "data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary"
                )}
              >
                <User className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Personal</span>
              </TabsTrigger>
              <TabsTrigger 
                value="business" 
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md transition-all",
                  "data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary"
                )}
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Business</span>
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
                  "data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary"
                )}
              >
                <Printer className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Equipment</span>
              </TabsTrigger>
              <TabsTrigger 
                value="tickets" 
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md transition-all",
                  "data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary"
                )}
              >
                <Ticket className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Tickets</span>
                {openTickets.length > 0 && (
                  <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[10px] leading-none">
                    {openTickets.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-hidden">
              <TabsContent value="details" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-5">
                    <CustomerDetailsForm 
                      customer={customer}
                      onClose={onClose}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="business" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-5">
                    <BusinessInformationForm 
                      customer={customer}
                      onClose={onClose}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="equipment" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-5">
                    <EquipmentManager customerId={customer.id} />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="tickets" className="h-full m-0">
                <ScrollArea className="h-full">
                  <div className="p-5 space-y-4">
                    {/* Ticket Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-foreground">Tickets</h3>
                        <Badge variant="outline" className="text-xs">
                          {customer.ticketCount || 0} total
                        </Badge>
                      </div>
                      <Button 
                        size="sm" 
                        variant={showNewTicketForm ? "secondary" : "default"}
                        onClick={() => setShowNewTicketForm(!showNewTicketForm)}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        New Ticket
                      </Button>
                    </div>

                    {/* Inline New Ticket Form */}
                    {showNewTicketForm && (
                      <NewTicketForm
                        onSubmit={onCreateTicket}
                        onCancel={() => setShowNewTicketForm(false)}
                      />
                    )}

                    {/* Tickets List */}
                    <TicketsList
                      key={refreshKey}
                      tickets={customer.activeTickets || []}
                      onUpdateTicketStatus={(ticketId, status) => 
                        handleUpdateTicketStatus(ticketId, status, customer.id)
                      }
                      onAddTimeEntry={(ticketId, entry) => 
                        handleAddTimeEntry(ticketId, entry, customer.id)
                      }
                      customerEmail={customer.email}
                      customerName={customer.name}
                      customerId={customer.id}
                    />
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
