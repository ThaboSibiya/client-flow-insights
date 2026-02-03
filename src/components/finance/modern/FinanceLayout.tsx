import { useState, useEffect, useCallback } from 'react';
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from '@/components/ui/resizable';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebtorData, DebtorCustomer } from '@/hooks/useDebtorData';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useToast } from '@/hooks/use-toast';
import { generateFinanceReport, downloadReport } from '@/utils/financeReportGenerator';

import FinanceHeader from './FinanceHeader';
import PriorityDebtorList from './PriorityDebtorList';
import DebtorDetailView from './DebtorDetailView';
import BulkReminderModal from './BulkReminderModal';
import FinanceEmptyState from './FinanceEmptyState';

const FinanceLayout = () => {
  const { toast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { debtors, loading, stats, refetch } = useDebtorData();
  
  const [selectedDebtor, setSelectedDebtor] = useState<DebtorCustomer | null>(null);
  const [bulkReminderOpen, setBulkReminderOpen] = useState(false);

  // Auto-select first debtor when data loads
  useEffect(() => {
    if (debtors.length > 0 && !selectedDebtor) {
      setSelectedDebtor(debtors[0]);
    }
  }, [debtors, selectedDebtor]);

  // Keyboard navigation
  const navigateDebtors = useCallback((direction: 'up' | 'down') => {
    if (debtors.length === 0) return;
    
    const currentIndex = selectedDebtor 
      ? debtors.findIndex(d => d.id === selectedDebtor.id)
      : -1;
    
    let newIndex: number;
    if (direction === 'up') {
      newIndex = currentIndex <= 0 ? debtors.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex >= debtors.length - 1 ? 0 : currentIndex + 1;
    }
    
    setSelectedDebtor(debtors[newIndex]);
  }, [debtors, selectedDebtor]);

  const handleGenerateReport = useCallback(() => {
    try {
      const report = generateFinanceReport(debtors);
      downloadReport(report);
      toast({
        title: 'Report Generated',
        description: 'Debtor aging report downloaded successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate report.',
        variant: 'destructive',
      });
    }
  }, [debtors, toast]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'ArrowUp',
      action: () => navigateDebtors('up'),
      description: 'Navigate to previous debtor',
    },
    {
      key: 'ArrowDown',
      action: () => navigateDebtors('down'),
      description: 'Navigate to next debtor',
    },
    {
      key: 'r',
      ctrlKey: true,
      action: () => setBulkReminderOpen(true),
      description: 'Open bulk reminder modal',
    },
    {
      key: 'g',
      ctrlKey: true,
      action: handleGenerateReport,
      description: 'Generate report',
    },
  ]);

  const handleQuickAction = (debtor: DebtorCustomer, action: 'email' | 'call' | 'view') => {
    if (action === 'email') {
      window.location.href = `mailto:${debtor.email}`;
    } else if (action === 'call' && debtor.phone) {
      window.location.href = `tel:${debtor.phone}`;
    } else {
      setSelectedDebtor(debtor);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <div className="border-b px-4 py-3">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex-1 flex">
          <div className="w-80 border-r p-4 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
          <div className="flex-1 p-4">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Empty state when no debtors
  if (debtors.length === 0) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <FinanceHeader
          stats={stats}
          onGenerateReport={handleGenerateReport}
          onBulkReminder={() => setBulkReminderOpen(true)}
          onRefresh={refetch}
        />
        <FinanceEmptyState />
      </div>
    );
  }

  // Mobile: Show list or detail based on selection
  if (isMobile) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <FinanceHeader
          stats={stats}
          onGenerateReport={handleGenerateReport}
          onBulkReminder={() => setBulkReminderOpen(true)}
          onRefresh={refetch}
        />
        
        {selectedDebtor ? (
          <div className="flex-1 flex flex-col">
            <button
              onClick={() => setSelectedDebtor(null)}
              className="px-4 py-2 text-sm text-primary hover:underline text-left border-b"
            >
              ← Back to list
            </button>
            <div className="flex-1 overflow-hidden">
              <DebtorDetailView
                debtor={selectedDebtor}
                onRefresh={refetch}
                onSendReminder={() => {
                  toast({
                    title: 'Opening Reminder',
                    description: 'Prepare to send reminder to ' + selectedDebtor.name,
                  });
                }}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <PriorityDebtorList
              debtors={debtors}
              selectedDebtor={selectedDebtor}
              onSelectDebtor={setSelectedDebtor}
              onQuickAction={handleQuickAction}
            />
          </div>
        )}

        <BulkReminderModal
          open={bulkReminderOpen}
          onOpenChange={setBulkReminderOpen}
          debtors={debtors}
          onSuccess={refetch}
        />
      </div>
    );
  }

  // Desktop: Split pane layout
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <FinanceHeader
        stats={stats}
        onGenerateReport={handleGenerateReport}
        onBulkReminder={() => setBulkReminderOpen(true)}
        onRefresh={refetch}
      />

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left Panel: Priority Work Queue */}
          <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
            <PriorityDebtorList
              debtors={debtors}
              selectedDebtor={selectedDebtor}
              onSelectDebtor={setSelectedDebtor}
              onQuickAction={handleQuickAction}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel: Debtor Detail */}
          <ResizablePanel defaultSize={70}>
            {selectedDebtor ? (
              <DebtorDetailView
                debtor={selectedDebtor}
                onRefresh={refetch}
                onSendReminder={() => {
                  toast({
                    title: 'Opening Reminder',
                    description: 'Prepare to send reminder to ' + selectedDebtor.name,
                  });
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Select a debtor to view details
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <BulkReminderModal
        open={bulkReminderOpen}
        onOpenChange={setBulkReminderOpen}
        debtors={debtors}
        onSuccess={refetch}
      />
    </div>
  );
};

export default FinanceLayout;
