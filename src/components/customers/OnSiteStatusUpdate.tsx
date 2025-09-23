
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check } from "lucide-react";
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
    console.log('Selected customer:', customer.name);

    // Load tickets for the selected customer with security validation
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

  // Request location only when modal opens and user has privileges
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto bg-white shadow-xl">
        <CardHeader className="text-center bg-gradient-to-r from-green-50 to-blue-50">
          <CardTitle className="flex items-center gap-2 justify-center text-green-700">
            <Check className="h-5 w-5" />
            Job Completion Update
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {error && <ErrorDisplay error={error} />}

          {loading ? (
            <LoadingState />
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Select Customer</label>
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
                  <div className="space-y-4">
                    <SelectedCustomerCard
                      customer={selectedCustomer}
                      onClear={clearSelection}
                    />
                    
                    <Tabs defaultValue="status" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="status">Update Status</TabsTrigger>
                        <TabsTrigger value="tickets">Active Tickets ({customerTickets.length})</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="status" className="space-y-4">
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
                      
                      <TabsContent value="tickets">
                        <TicketsTab 
                          tickets={customerTickets} 
                          loading={ticketsLoading}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-2 hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={onSubmit}
                  disabled={!selectedCustomer || submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Complete Job'
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OnSiteStatusUpdate;
