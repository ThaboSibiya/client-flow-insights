import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { QuoteInvoice } from '@/types/quote';
import DocumentCard from './DocumentCard';
import DocumentFilterTabs, { DocumentFilter } from './DocumentFilterTabs';
import { FileText } from 'lucide-react';
import { useQuoteEmail } from '@/hooks/useQuoteEmail';
import { useRevenueOptimization } from '@/hooks/useRevenueOptimization';
import { usePDFGeneration } from '@/hooks/usePDFGeneration';
import { toast } from '@/hooks/use-toast';

interface DocumentListProps {
  documents: QuoteInvoice[];
  searchQuery: string;
  selectedId: string | null;
  onSelect: (doc: QuoteInvoice) => void;
  onEdit: (doc: QuoteInvoice) => void;
  onPreview: (doc: QuoteInvoice) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  searchQuery,
  selectedId,
  onSelect,
  onEdit,
  onPreview,
}) => {
  const [activeFilter, setActiveFilter] = useState<DocumentFilter>('all');
  const { sendQuoteEmail } = useQuoteEmail();
  const { convertQuoteToInvoice } = useRevenueOptimization();
  const { generatePDF } = usePDFGeneration();

  // Calculate filter counts
  const counts = useMemo(() => ({
    all: documents.length,
    quotes: documents.filter(d => d.type === 'quote').length,
    invoices: documents.filter(d => d.type === 'invoice').length,
    draft: documents.filter(d => d.status === 'draft').length,
    sent: documents.filter(d => d.status === 'sent').length,
    accepted: documents.filter(d => d.status === 'accepted').length,
    paid: documents.filter(d => d.status === 'paid').length,
    overdue: documents.filter(d => d.status === 'overdue').length,
  }), [documents]);

  // Filter and search documents
  const filteredDocuments = useMemo(() => {
    let result = [...documents];

    // Apply filter
    switch (activeFilter) {
      case 'quotes':
        result = result.filter(d => d.type === 'quote');
        break;
      case 'invoices':
        result = result.filter(d => d.type === 'invoice');
        break;
      case 'draft':
      case 'sent':
      case 'accepted':
      case 'paid':
      case 'overdue':
        result = result.filter(d => d.status === activeFilter);
        break;
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(d =>
        d.number.toLowerCase().includes(query) ||
        d.customer_name?.toLowerCase().includes(query) ||
        d.customer_email?.toLowerCase().includes(query) ||
        d.subject?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [documents, activeFilter, searchQuery]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!filteredDocuments.length) return;
      
      const currentIndex = selectedId 
        ? filteredDocuments.findIndex(d => d.id === selectedId)
        : -1;

      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        const nextIndex = currentIndex < filteredDocuments.length - 1 ? currentIndex + 1 : 0;
        onSelect(filteredDocuments[nextIndex]);
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredDocuments.length - 1;
        onSelect(filteredDocuments[prevIndex]);
      } else if (e.key === 'Enter' && selectedId) {
        e.preventDefault();
        const doc = filteredDocuments.find(d => d.id === selectedId);
        if (doc) onPreview(doc);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredDocuments, selectedId, onSelect, onPreview]);

  const handleSendEmail = useCallback(async (doc: QuoteInvoice) => {
    try {
      await sendQuoteEmail(doc);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }, [sendQuoteEmail]);

  const handleDownloadPDF = useCallback((doc: QuoteInvoice) => {
    generatePDF(doc, {
      includeBranding: true,
      template: 'professional',
      watermark: false
    });
  }, [generatePDF]);

  const handleConvertToInvoice = useCallback(async (doc: QuoteInvoice) => {
    try {
      const invoice = await convertQuoteToInvoice(doc.id);
      if (invoice) {
        toast({
          title: "Quote Converted",
          description: `Quote ${doc.number} has been converted to Invoice ${invoice.number}`,
        });
      }
    } catch (error) {
      console.error('Failed to convert quote:', error);
    }
  }, [convertQuoteToInvoice]);

  const handleDuplicate = useCallback((doc: QuoteInvoice) => {
    toast({
      title: "Coming Soon",
      description: "Duplicate functionality will be available soon",
    });
  }, []);

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-1">No Documents Found</h3>
        <p className="text-sm text-muted-foreground">
          Create your first quote or invoice to get started
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filter Tabs */}
      <div className="px-4 py-3 border-b border-border">
        <DocumentFilterTabs
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={counts}
        />
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No documents match your filters
            </p>
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              isSelected={selectedId === doc.id}
              onSelect={() => onSelect(doc)}
              onEdit={() => onEdit(doc)}
              onPreview={() => onPreview(doc)}
              onSendEmail={() => handleSendEmail(doc)}
              onDownloadPDF={() => handleDownloadPDF(doc)}
              onConvertToInvoice={doc.type === 'quote' && doc.status === 'accepted' 
                ? () => handleConvertToInvoice(doc) 
                : undefined
              }
              onDuplicate={() => handleDuplicate(doc)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentList;
