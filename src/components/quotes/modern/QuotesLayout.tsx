import React, { useState, useCallback, useEffect } from 'react';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { QuoteInvoice, QuoteInvoiceInsert, QuoteInvoiceType } from '@/types/quote';
import { useFetchQuotes } from '@/hooks/useFetchQuotes';
import { useCreateQuote } from '@/hooks/mutations/useCreateQuote';
import { useUpdateQuote } from '@/hooks/mutations/useUpdateQuote';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useMediaQuery } from '@/hooks/use-media-query';
import QuotesHeader from './QuotesHeader';
import DocumentList from './DocumentList';
import DocumentDetailPanel from './DocumentDetailPanel';
import DocumentFormSlideOver from './DocumentFormSlideOver';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const QuotesLayout: React.FC = () => {
  const { toast } = useToast();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<QuoteInvoice | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState('preview');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<QuoteInvoiceType>('quote');
  const [editingDocument, setEditingDocument] = useState<QuoteInvoice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  const { quotes, isLoading, error } = useFetchQuotes();
  const { createQuoteInvoice } = useCreateQuote();
  const { updateQuoteInvoice } = useUpdateQuote();

  // Handle fetch errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error Loading Documents",
        description: "Failed to load quotes and invoices. Please try refreshing.",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'q') {
        e.preventDefault();
        handleCreateNew('quote');
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        handleCreateNew('invoice');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCreateNew = useCallback((type: QuoteInvoiceType) => {
    setFormType(type);
    setEditingDocument(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((doc: QuoteInvoice) => {
    setFormType(doc.type);
    setEditingDocument(doc);
    setIsFormOpen(true);
  }, []);

  const handlePreview = useCallback((doc: QuoteInvoice) => {
    setSelectedDocument(doc);
    setActiveDetailTab('preview');
    if (isMobile) {
      setShowMobileDetail(true);
    }
  }, [isMobile]);

  const handleSelect = useCallback((doc: QuoteInvoice) => {
    setSelectedDocument(doc);
    if (isMobile) {
      setShowMobileDetail(true);
    }
  }, [isMobile]);

  const handleSave = useCallback(async (data: QuoteInvoiceInsert) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      let savedDoc: QuoteInvoice;
      
      if (editingDocument) {
        savedDoc = await updateQuoteInvoice({
          id: editingDocument.id,
          quoteData: data
        });
      } else {
        savedDoc = await createQuoteInvoice(data);
      }
      
      if (savedDoc) {
        setSelectedDocument(savedDoc);
        setActiveDetailTab('preview');
        toast({
          title: "Success",
          description: `${data.type === 'quote' ? 'Quote' : 'Invoice'} saved successfully.`
        });
      }
    } catch (error) {
      console.error("Failed to save:", error);
      toast({
        title: "Error",
        description: `Failed to save ${data.type}. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [editingDocument, updateQuoteInvoice, createQuoteInvoice, isSubmitting, toast]);

  const totalQuotes = quotes.filter(d => d.type === 'quote').length;
  const totalInvoices = quotes.filter(d => d.type === 'invoice').length;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="h-[calc(100dvh-4rem)] flex flex-col">
        {showMobileDetail && selectedDocument ? (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileDetail(false)}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <span className="font-medium">{selectedDocument.number}</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <DocumentDetailPanel
                document={selectedDocument}
                activeTab={activeDetailTab}
                onTabChange={setActiveDetailTab}
                onCreateNew={handleCreateNew}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4">
              <QuotesHeader
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onCreateNew={handleCreateNew}
                totalQuotes={totalQuotes}
                totalInvoices={totalInvoices}
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <DocumentList
                documents={quotes}
                searchQuery={searchQuery}
                selectedId={selectedDocument?.id || null}
                onSelect={handleSelect}
                onEdit={handleEdit}
                onPreview={handlePreview}
              />
            </div>
          </div>
        )}

        <DocumentFormSlideOver
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          type={formType}
          initialData={editingDocument}
          onSave={handleSave}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }

  // Desktop Layout with Resizable Panels
  return (
    <div className="h-[calc(100dvh-4rem)] flex flex-col">
      <div className="p-6 pb-4">
        <QuotesHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onCreateNew={handleCreateNew}
          totalQuotes={totalQuotes}
          totalInvoices={totalInvoices}
        />
      </div>

      <div className="flex-1 overflow-hidden px-6 pb-6">
        <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border border-border bg-card">
          {/* Document List Panel */}
          <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
            <DocumentList
              documents={quotes}
              searchQuery={searchQuery}
              selectedId={selectedDocument?.id || null}
              onSelect={handleSelect}
              onEdit={handleEdit}
              onPreview={handlePreview}
            />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Detail Panel */}
          <ResizablePanel defaultSize={65}>
            <DocumentDetailPanel
              document={selectedDocument}
              activeTab={activeDetailTab}
              onTabChange={setActiveDetailTab}
              onCreateNew={handleCreateNew}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <DocumentFormSlideOver
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        type={formType}
        initialData={editingDocument}
        onSave={handleSave}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default QuotesLayout;
