import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FileText, Receipt, Keyboard } from "lucide-react";
import { QuoteInvoiceType } from '@/types/quote';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuotesHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateNew: (type: QuoteInvoiceType) => void;
  totalQuotes: number;
  totalInvoices: number;
}

const QuotesHeader: React.FC<QuotesHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onCreateNew,
  totalQuotes,
  totalInvoices,
}) => {
  return (
    <div className="flex flex-col gap-4 pb-4 border-b border-border">
      {/* Title & Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Documents
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage quotes and invoices
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => onCreateNew('quote')}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Quote
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div className="flex items-center gap-2">
                  <Keyboard className="h-3 w-3" />
                  <span>⌘ + Q</span>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => onCreateNew('invoice')}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Invoice
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <div className="flex items-center gap-2">
                  <Keyboard className="h-3 w-3" />
                  <span>⌘ + I</span>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Search & Stats Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents... (⌘K)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-background border-input"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1">
            <FileText className="h-3.5 w-3.5" />
            <span>{totalQuotes} Quotes</span>
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1">
            <Receipt className="h-3.5 w-3.5" />
            <span>{totalInvoices} Invoices</span>
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default QuotesHeader;
