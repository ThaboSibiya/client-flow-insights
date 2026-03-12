import React, { useState, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { CustomerStatus } from '@/types/customer';
import { OnSiteStatusUpdateProps, Customer, OnSiteTicket, JobPhoto } from './onsite/types';
import { useSecureCustomerData } from '@/hooks/useSecureCustomerData';
import { useCustomerSearch } from './onsite/hooks/useCustomerSearch';
import { useLocation } from './onsite/hooks/useLocation';
import { useSecureJobCompletion } from '@/hooks/useSecureJobCompletion';
import { useIsMobile } from '@/hooks/use-mobile';
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
import { MobileJobCompletionWrapper } from './onsite/components/MobileJobCompletionWrapper';
import { sanitizeInput } from '@/utils/securityUtils';
import { cn } from '@/lib/utils';

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
  const isMobile = useIsMobile();

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
      case 'ticket': return true;
      case 'work': return true;
      case 'photos': return true;
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
              <h3 className={cn("font-semibold text-foreground", isMobile ? "text-base" : "text-sm")}>Select Client</h3>
              <p className={cn("text-muted-foreground", isMobile ? "text-sm" : "text-xs")}>Choose the client for this job completion</p>
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
              <h3 className={cn("font-semibold text-foreground", isMobile ? "text-base" : "text-sm")}>Link Ticket</h3>
              <p className={cn("text-muted-foreground", isMobile ? "text-sm" : "text-xs")}>Optionally link an open ticket to resolve it</p>
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
              <h3 className={cn("font-semibold text-foreground", isMobile ? "text-base" : "text-sm")}>Work Details</h3>
              <p className={cn("text-muted-foreground", isMobile ? "text-sm" : "text-xs")}>Describe the work performed and update the client status</p>
            </div>
            <div className="space-y-1.5">
              <label className={cn("font-medium text-foreground", isMobile ? "text-base" : "text-sm")}>Work Summary</label>
              <Input
                placeholder="Brief description of work performed..."
                value={workSummary}
                onChange={(e) => setWorkSummary(sanitizeInput(e.target.value, 500))}
                maxLength={500}
                className={cn(isMobile && "h-12 text-base")}
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
              <h3 className={cn("font-semibold text-foreground", isMobile ? "text-base" : "text-sm")}>Photo Evidence</h3>
              <p className={cn("text-muted-foreground", isMobile ? "text-sm" : "text-xs")}>Capture before/after photos as proof of work</p>
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
    <MobileJobCompletionWrapper isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className={cn(
        "border-b border-border shrink-0",
        isMobile ? "px-4 pt-2 pb-3" : "px-5 pt-5 pb-3"
      )}>
        <div className={cn("flex items-center gap-2", isMobile ? "text-lg" : "text-base")}>
          <div className={cn(
            "rounded-full bg-primary/10 flex items-center justify-center",
            isMobile ? "h-9 w-9" : "h-7 w-7"
          )}>
            <Check className={cn(isMobile ? "h-4 w-4" : "h-3.5 w-3.5", "text-primary")} />
          </div>
          <span className="font-semibold text-foreground">Job Completion</span>
        </div>
        <p className={cn("text-muted-foreground mt-1", isMobile ? "text-sm" : "text-xs")}>
          Complete a job, update status, and attach proof of work
        </p>
      </div>

      {/* Stepper */}
      <div className={cn(
        "border-b border-border shrink-0 bg-muted/20",
        isMobile ? "px-3 py-2.5" : "px-5 py-3"
      )}>
        <JobCompletionStepper steps={steps} />
      </div>

      {/* Content */}
      <div className={cn(
        "flex-1 overflow-y-auto ios-scroll",
        isMobile ? "px-4 py-4" : "px-5 py-4"
      )}>
        {error && <ErrorDisplay error={error} />}
        {loading ? <LoadingState /> : renderStepContent()}
      </div>

      {/* Footer navigation - touch-friendly on mobile */}
      <div className={cn(
        "shrink-0 border-t border-border flex gap-3 bg-background bottom-bar-safe",
        isMobile ? "px-4 py-3" : "px-5 py-3"
      )}>
        {isFirstStep ? (
          <Button
            variant="outline"
            onClick={onClose}
            className={cn("flex-1", isMobile && "h-12 text-base")}
            size={isMobile ? "lg" : "sm"}
            disabled={submitting}
          >
            Cancel
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={goBack}
            className={cn("flex-1", isMobile && "h-12 text-base")}
            size={isMobile ? "lg" : "sm"}
            disabled={submitting}
          >
            <ChevronLeft className={cn(isMobile ? "h-5 w-5 mr-1.5" : "h-3.5 w-3.5 mr-1")} />
            Back
          </Button>
        )}

        {isLastStep ? (
          <Button
            onClick={onSubmit}
            disabled={!selectedCustomer || submitting}
            className={cn("flex-1", isMobile && "h-12 text-base")}
            size={isMobile ? "lg" : "sm"}
          >
            {submitting ? (
              <>
                <div className={cn(
                  "animate-spin rounded-full border-b-2 border-primary-foreground mr-1.5",
                  isMobile ? "h-5 w-5" : "h-3.5 w-3.5"
                )} />
                Completing...
              </>
            ) : (
              <>
                <Check className={cn(isMobile ? "h-5 w-5 mr-1.5" : "h-3.5 w-3.5 mr-1")} />
                Complete Job
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={goNext}
            disabled={!canProceed}
            className={cn("flex-1", isMobile && "h-12 text-base")}
            size={isMobile ? "lg" : "sm"}
          >
            Next
            <ChevronRight className={cn(isMobile ? "h-5 w-5 ml-1.5" : "h-3.5 w-3.5 ml-1")} />
          </Button>
        )}
      </div>
    </MobileJobCompletionWrapper>
  );
};

export default OnSiteStatusUpdate;
