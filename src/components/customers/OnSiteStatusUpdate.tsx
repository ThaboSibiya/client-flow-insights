import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { CustomerStatus } from '@/types/customer';
import { OnSiteStatusUpdateProps, Customer, OnSiteTicket, JobPhoto } from './onsite/types';
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
import { TicketSelector } from './onsite/components/TicketSelector';
import { PhotoUploader } from './onsite/components/PhotoUploader';
import { sanitizeInput } from '@/utils/securityUtils';

const OnSiteStatusUpdate = ({ isOpen, onClose }: OnSiteStatusUpdateProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newStatus, setNewStatus] = useState<CustomerStatus>('existing');
  const [notes, setNotes] = useState('');
  const [workSummary, setWorkSummary] = useState('');
  const [customerTickets, setCustomerTickets] = useState<OnSiteTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<OnSiteTicket | null>(null);
  const [photos, setPhotos] = useState<JobPhoto[]>([]);

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
    setWorkSummary('');
    setSearchTerm('');
    setIsDropdownOpen(false);
    setSelectedTicket(null);
    setPhotos([]);

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
    setWorkSummary('');
    setCustomerTickets([]);
    setSelectedTicket(null);
    setPhotos([]);
  };

  React.useEffect(() => {
    if (isOpen) {
      requestLocation();
    }
  }, [isOpen, requestLocation]);

  const onSubmit = async () => {
    if (selectedCustomer) {
      const success = await handleSubmit({
        selectedCustomer,
        newStatus,
        notes,
        workSummary,
        location,
        selectedTicket,
        photos,
      });
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
            <Check className="h-4 w-4 text-primary" />
            Job Completion
          </DialogTitle>
          <DialogDescription className="text-xs">
            Complete a job, update status, and attach proof of work
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {error && <ErrorDisplay error={error} />}

          {loading ? (
            <LoadingState />
          ) : (
            <>
              {/* Step 1: Customer Selection */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Customer</label>
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

                    {/* Step 2: Link ticket (optional) */}
                    <TicketSelector
                      tickets={customerTickets}
                      selectedTicketId={selectedTicket?.id || null}
                      onSelect={setSelectedTicket}
                      loading={ticketsLoading}
                    />

                    {/* Step 3: Work summary */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Work Summary</label>
                      <Input
                        placeholder="Brief description of work performed..."
                        value={workSummary}
                        onChange={(e) => setWorkSummary(sanitizeInput(e.target.value, 500))}
                        maxLength={500}
                      />
                    </div>

                    {/* Step 4: Status update */}
                    <StatusSelector
                      value={newStatus}
                      onChange={setNewStatus}
                    />

                    {/* Step 5: Photos */}
                    <PhotoUploader
                      photos={photos}
                      onPhotosChange={setPhotos}
                      customerId={selectedCustomer.id}
                    />

                    {/* Step 6: Notes */}
                    <SecureNotesInput
                      value={notes}
                      onChange={setNotes}
                      label="Additional Notes"
                      placeholder="Any additional details..."
                    />

                    <LocationIndicator hasLocation={!!location} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Sticky footer */}
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
            className="flex-1"
            size="sm"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-primary-foreground mr-1.5" />
                Completing...
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
