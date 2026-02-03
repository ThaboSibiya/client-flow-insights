import React from 'react';
import { FileText, Plus, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuoteInvoiceType } from '@/types/quote';

interface DocumentEmptyStateProps {
  onCreateNew: (type: QuoteInvoiceType) => void;
}

const DocumentEmptyState: React.FC<DocumentEmptyStateProps> = ({ onCreateNew }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No Document Selected
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Select a document from the list to view its details, or create a new one to get started.
      </p>
      
      <div className="flex items-center gap-3">
        <Button
          onClick={() => onCreateNew('quote')}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Quote
        </Button>
        <Button
          onClick={() => onCreateNew('invoice')}
          variant="outline"
        >
          <Receipt className="h-4 w-4 mr-2" />
          New Invoice
        </Button>
      </div>
      
      <div className="mt-8 pt-6 border-t border-border w-full max-w-sm">
        <p className="text-xs text-muted-foreground mb-3">Keyboard Shortcuts</p>
        <div className="flex flex-wrap justify-center gap-3 text-xs">
          <span className="px-2 py-1 bg-muted rounded">
            <kbd className="font-mono">⌘K</kbd> Search
          </span>
          <span className="px-2 py-1 bg-muted rounded">
            <kbd className="font-mono">⌘Q</kbd> New Quote
          </span>
          <span className="px-2 py-1 bg-muted rounded">
            <kbd className="font-mono">⌘I</kbd> New Invoice
          </span>
          <span className="px-2 py-1 bg-muted rounded">
            <kbd className="font-mono">↑↓</kbd> Navigate
          </span>
        </div>
      </div>
    </div>
  );
};

export default DocumentEmptyState;
