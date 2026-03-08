import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, X } from "lucide-react";
import { CustomerStatus } from '@/types/customer';
import { OnSiteStatusUpdateProps, Customer, OnSiteTicket } from './onsite/types';
import { useSecureCustomerData } from '@/hooks/useSecureCustomerData';
import { useCustomerSearch } from './onsite/hooks/useCustomerSearch';
import { useLocation } from './onsite/hooks/useLocation';
import { useSecureJobCompletion } from '@/hooks/useSecureJobCompletion';
import { SecureCustomerSearchInput } from './onsite/components/SecureCustomerSearchInput';
import { CustomerDropdown } from './onsite/components/CustomerDropdown';
import { SelectedCustomerCard } from './onsite/components/SelectedCustomerCard';
import { StatusSelector } from './onsite/components/StatusSelector';
import { SecureNotesInput } from './onsite/components/SecureNotesInput';
import { LocationIndicator } from './onsite/components/LocationIndicator';
import { LoadingState } from './onsite/components/LoadingState';
import { ErrorDisplay } from './onsite/components/ErrorDisplay';
import { TicketsTab } from './onsite/components/TicketsTab';

const OnSiteStatusUpdate = ({ isOpen, onClose }: OnSiteStatusUpdateProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newStatus, setNewStatus] = useState<CustomerStatus>('existing');
  const [notes, setNotes] = useState('');
  const [customerTickets, setCustomerTickets] = useState<OnSiteTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);

  const { customers, loading, error, loadCustomerTickets } = useSecureCustomerData(isOpen);
  const { location, requestLocation } = useLocation();
  const { submitting, handleSubmit } = useSecureJobCompletion();
  
  const {
    searchTerm,
    setSearchTerm,
    filteredCustomers,
    isDropdownOpen,
    setIsDropdownOpen
  } = useCustomerSearch(customers);

  const handleCustomerSelect = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setNewStatus(customer.status);
    setNotes('');
    setSearchTerm('');
    setIsDropdownOpen(false);

    setTicketsLoading(true);
    const tickets = await loadCustomerTickets(customer.id);
    setCustomerTickets(tickets);
    setTicketsLoading(false);
  };

  const clearSelection = () => {
    setSelectedCustomer(null);
    setSearchTerm('');
    setNewStatus('existing');
    setNotes('');
    setCustomerTickets([]);
  };

  React.useEffect(() => {
    if (isOpen) {
      requestLocation();
    }
  }, [isOpen, requestLocation]);

  const onSubmit = async () => {
    if (selectedCustomer) {
      const success = await handleSubmit(selectedCustomer, newStatus, notes, location);
      if (success) {
        clearSelection();
        onClose();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 flex flex-col max-h-[85vh]">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Check className="h-4 w-4 text-green-600" />
            Job Completion
          </DialogTitle>
          <DialogDescription className="text-xs">
            Update job status for the selected customer
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {error && <ErrorDisplay error={error} />}

          {loading ? (
            <LoadingState />
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Select Customer</label>
                {!selectedCustomer ? (
                  <div className="relative">
                    <SecureCustomerSearchInput
                      searchTerm={searchTerm}
                      onSearchChange={(value) => {
                        setSearchTerm(value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      disabled={customers.length === 0}
                    />
                    
                    <CustomerDropdown
                      customers={filteredCustomers}
                      isOpen={isDropdownOpen}
                      searchTerm={searchTerm}
                      onCustomerSelect={handleCustomerSelect}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <SelectedCustomerCard
                      customer={selectedCustomer}
                      onClear={clearSelection}
                    />
                    
                    <Tabs defaultValue="status" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 h-9">
                        <TabsTrigger value="status" className="text-xs">Update Status</TabsTrigger>
                        <TabsTrigger value="tickets" className="text-xs">
                          Tickets ({customerTickets.length})
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="status" className="space-y-3 mt-3">
                        <StatusSelector
                          value={newStatus}
                          onChange={setNewStatus}
                        />

                        <SecureNotesInput
                          value={notes}
                          onChange={setNotes}
                        />

                        <LocationIndicator hasLocation={!!location} />
                      </TabsContent>
                      
                      <TabsContent value="tickets" className="mt-3">
                        <TicketsTab 
                          tickets={customerTickets} 
                          loading={ticketsLoading}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Sticky footer - always visible */}
        <div className="shrink-0 border-t border-border px-5 py-3 flex gap-3 bg-background">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            size="sm"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!selectedCustomer || submitting}
            className="flex-1 bg-green-600 hover:bg-green-700"
            size="sm"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-1.5" />
                Updating...
              </>
            ) : (
              'Complete Job'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnSiteStatusUpdate;
