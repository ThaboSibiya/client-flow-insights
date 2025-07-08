
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";

interface QuoteInvoiceHeaderProps {
  onCreateNew: (type: 'quote' | 'invoice') => void;
}

const QuoteInvoiceHeader = ({ onCreateNew }: QuoteInvoiceHeaderProps) => {
  return (
    <div className="bg-gradient-to-r from-quikle-primary/10 via-quikle-accent/8 to-quikle-secondary/10 p-6 rounded-xl border border-quikle-silver/20 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-quikle-primary to-quikle-secondary bg-clip-text text-transparent">
            Quotes & Invoices
          </h1>
          <p className="text-quikle-slate text-sm mt-1">
            Create professional quotes and invoices with automated workflow management
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => onCreateNew('quote')} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Quote
          </Button>
          <Button 
            onClick={() => onCreateNew('invoice')} 
            variant="outline"
            size="sm"
            className="border-quikle-silver text-quikle-charcoal hover:bg-quikle-crystal"
          >
            <FileText className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuoteInvoiceHeader;
