import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  Edit, 
  Send, 
  Download, 
  MoreHorizontal,
  Zap,
  FileText,
  Receipt,
  Copy
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QuoteInvoice } from '@/types/quote';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DocumentCardProps {
  document: QuoteInvoice;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onPreview: () => void;
  onSendEmail: () => void;
  onDownloadPDF: () => void;
  onConvertToInvoice?: () => void;
  onDuplicate: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  isSelected,
  onSelect,
  onEdit,
  onPreview,
  onSendEmail,
  onDownloadPDF,
  onConvertToInvoice,
  onDuplicate,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusStyles = (status: string): string => {
    switch (status) {
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'sent': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'accepted': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected': return 'bg-destructive/10 text-destructive';
      case 'paid': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'overdue': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const showConvertButton = document.type === 'quote' && document.status === 'accepted';

  return (
    <Card
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "p-4 cursor-pointer transition-all duration-200",
        "hover:shadow-md hover:border-primary/30",
        isSelected && "ring-2 ring-primary border-primary bg-primary/5"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Icon & Main Info */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className={cn(
            "p-2 rounded-lg shrink-0",
            document.type === 'quote' 
              ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
              : "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
          )}>
            {document.type === 'quote' ? (
              <FileText className="h-4 w-4" />
            ) : (
              <Receipt className="h-4 w-4" />
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-foreground truncate">
                {document.number}
              </span>
              <Badge className={cn("text-[10px] px-1.5 py-0", getStatusStyles(document.status))}>
                {document.status}
              </Badge>
              {showConvertButton && (
                <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  <Zap className="h-2.5 w-2.5 mr-0.5" />
                  Convert
                </Badge>
              )}
            </div>
            
            <p className="text-sm text-foreground truncate mt-0.5">
              {document.customer_name || 'No customer'}
            </p>
            
            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
              <span>
                {format(new Date(document.issue_date), 'MMM d, yyyy')}
              </span>
              {document.subject && (
                <span className="truncate">• {document.subject}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Amount & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right mr-2">
            <p className="font-bold text-sm text-foreground">
              {formatCurrency(document.total)}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase">
              {document.type}
            </p>
          </div>

          {/* Quick Actions - Show on Hover */}
          <div className={cn(
            "flex items-center gap-1 transition-opacity duration-200",
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => { e.stopPropagation(); onPreview(); }}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            {document.customer_email && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => { e.stopPropagation(); onSendEmail(); }}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onPreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {document.customer_email && (
                <DropdownMenuItem onClick={onSendEmail}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              {showConvertButton && onConvertToInvoice && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onConvertToInvoice}>
                    <Zap className="h-4 w-4 mr-2" />
                    Convert to Invoice
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
};

export default DocumentCard;
