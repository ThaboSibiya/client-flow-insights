import React, { useState, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { CustomerStatus } from '@/types/customer';
import { OnSiteStatusUpdateProps, Customer, OnSiteTicket, JobPhoto } from './onsite/types';
import { useSecureCustomerData } from '@/hooks/useSecureCustomerData';
import { useCustomerSearch } from './onsite/hooks/useCustomerSearch';
import { useLocation } from './onsite/hooks/useLocation';
import { useSecureJobCompletion } from '@/hooks/useSecureJobCompletion';
import { SecureCustomerSearchInput } from './onsite/components/SecureCustomerSearchInput';
import { CustomerDropdown } from './onsite/components/CustomerDropdown';
import { SelectedCustomerCard } from './onsite/components/SelectedCustomerCard';
import { StatusChangeVisual } from './onsite/components/StatusChangeVisual';
import { SecureNotesInput } from './onsite/components/SecureNotesInput';
import { LocationCapture } from './onsite/components/LocationCapture';
import { LoadingState } from './onsite/components/LoadingState';
import { ErrorDisplay } from './onsite/components/ErrorDisplay';
import { TicketSelector } from './onsite/components/TicketSelector';
import { PhotoUploader } from './onsite/components/PhotoUploader';
import { JobCompletionStepper, getStepDefinitions } from './onsite/components/JobCompletionStepper';
import { JobSummaryReview } from './onsite/components/JobSummaryReview';
import { sanitizeInput } from '@/utils/securityUtils';

const STEP_IDS = ['customer', 'ticket', 'work', 'photos', 'review'] as const;
type StepId = typeof STEP_IDS[number];

const OnSiteStatusUpdate = ({ isOpen, onClose }: OnSiteStatusUpdateProps) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newStatus, setNewStatus] = useState<CustomerStatus>('existing');
  const [notes, setNotes] = useState('');
  const [workSummary, setWorkSummary] = useState('');
  const [customerTickets, setCustomerTickets] = useState<OnSiteTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<OnSiteTicket | null>(null);
  const [photos, setPhotos] = useState<JobPhoto[]>([]);
  const [currentStep, setCurrentStep] = useState<StepId>('customer');

  const { customers, loading, error, loadCustomerTickets } = useSecureCustomerData(isOpen);
  const { location, requestLocation } = useLocation();
  const { submitting, handleSubmit } = useSecureJobCompletion();

  const {
    searchTerm,
    setSearchTerm,
    filteredCustomers,
    isDropdownOpen,
    setIsDropdownOpen,
  } = useCustomerSearch(customers);

  const currentStepIndex = STEP_IDS.indexOf(currentStep);

  const stepDefs = getStepDefinitions();
  const steps = useMemo(() => {
    return stepDefs.map((def, idx) => ({
      ...def,
      completed: idx < currentStepIndex,
      active: idx === currentStepIndex,
    }));
  }, [currentStepIndex]);

  const handleCustomerSelect = useCallback(async (customer: Customer) => {
    setSelectedCustomer(customer);
    setNewStatus(customer.status);
    setNotes('');
    setWorkSummary('');
    setSearchTerm('');
    setIsDropdownOpen(false);
    setSelectedTicket(null);
    setPhotos([]);
    setCurrentStep('ticket');

    setTicketsLoading(true);
    const tickets = await loadCustomerTickets(customer.id);
    setCustomerTickets(tickets);
    setTicketsLoading(false);
  }, [loadCustomerTickets, setSearchTerm, setIsDropdownOpen]);

  const clearSelection = useCallback(() => {
    setSelectedCustomer(null);
    setSearchTerm('');
    setNewStatus('existing');
    setNotes('');
    setWorkSummary('');
    setCustomerTickets([]);
    setSelectedTicket(null);
    setPhotos([]);
    setCurrentStep('customer');
  }, [setSearchTerm]);

  React.useEffect(() => {
    if (isOpen) {
      requestLocation();
    }
  }, [isOpen, requestLocation]);

  const goNext = useCallback(() => {
    const nextIdx = currentStepIndex + 1;
    if (nextIdx < STEP_IDS.length) {
      setCurrentStep(STEP_IDS[nextIdx]);
    }
  }, [currentStepIndex]);

  const goBack = useCallback(() => {
    const prevIdx = currentStepIndex - 1;
    if (prevIdx >= 0) {
      setCurrentStep(STEP_IDS[prevIdx]);
    }
  }, [currentStepIndex]);

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

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 'customer': return !!selectedCustomer;
      case 'ticket': return true; // optional
      case 'work': return true; // work summary optional
      case 'photos': return true; // photos optional
      case 'review': return !!selectedCustomer;
      default: return false;
    }
  }, [currentStep, selectedCustomer]);

  const isLastStep = currentStep === 'review';
  const isFirstStep = currentStep === 'customer';

  const renderStepContent = () => {
    switch (currentStep) {
      case 'customer':
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Select Client</h3>
              <p className="text-xs text-muted-foreground">Choose the client for this job completion</p>
            </div>
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
              <SelectedCustomerCard customer={selectedCustomer} onClear={clearSelection} />
            )}
          </div>
        );

      case 'ticket':
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Link Ticket</h3>
              <p className="text-xs text-muted-foreground">Optionally link an open ticket to resolve it</p>
            </div>
            <TicketSelector
              tickets={customerTickets}
              selectedTicketId={selectedTicket?.id || null}
              onSelect={setSelectedTicket}
              loading={ticketsLoading}
            />
          </div>
        );

      case 'work':
        return (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Work Details</h3>
              <p className="text-xs text-muted-foreground">Describe the work performed and update the client status</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Work Summary</label>
              <Input
                placeholder="Brief description of work performed..."
                value={workSummary}
                onChange={(e) => setWorkSummary(sanitizeInput(e.target.value, 500))}
                maxLength={500}
              />
            </div>
            {selectedCustomer && (
              <StatusChangeVisual
                currentStatus={selectedCustomer.status}
                newStatus={newStatus}
                onChange={setNewStatus}
              />
            )}
            <SecureNotesInput
              value={notes}
              onChange={setNotes}
              label="Additional Notes"
              placeholder="Any additional details..."
            />
            <LocationCapture location={location} onRetry={requestLocation} />
          </div>
        );

      case 'photos':
        return (
          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Photo Evidence</h3>
              <p className="text-xs text-muted-foreground">Capture before/after photos as proof of work</p>
            </div>
            {selectedCustomer && (
              <PhotoUploader
                photos={photos}
                onPhotosChange={setPhotos}
                customerId={selectedCustomer.id}
              />
            )}
          </div>
        );

      case 'review':
        return (
          <div className="space-y-3">
            {selectedCustomer && (
              <JobSummaryReview
                customer={selectedCustomer}
                newStatus={newStatus}
                workSummary={workSummary}
                notes={notes}
                selectedTicket={selectedTicket}
                photos={photos}
                hasLocation={!!location}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
          <SheetTitle className="flex items-center gap-2 text-base">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="h-3.5 w-3.5 text-primary" />
            </div>
            Job Completion
          </SheetTitle>
          <SheetDescription className="text-xs">
            Complete a job, update status, and attach proof of work
          </SheetDescription>
        </SheetHeader>

        {/* Stepper */}
        <div className="px-5 py-3 border-b border-border shrink-0 bg-muted/20">
          <JobCompletionStepper steps={steps} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {error && <ErrorDisplay error={error} />}
          {loading ? <LoadingState /> : renderStepContent()}
        </div>

        {/* Footer navigation */}
        <div className="shrink-0 border-t border-border px-5 py-3 flex gap-3 bg-background">
          {isFirstStep ? (
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              size="sm"
              disabled={submitting}
            >
              Cancel
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={goBack}
              className="flex-1"
              size="sm"
              disabled={submitting}
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              Back
            </Button>
          )}

          {isLastStep ? (
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
                <>
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Complete Job
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={goNext}
              disabled={!canProceed}
              className="flex-1"
              size="sm"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default OnSiteStatusUpdate;
