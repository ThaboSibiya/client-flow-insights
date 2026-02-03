import React from 'react';
import { cn } from '@/lib/utils';
import { FileText, Receipt, Clock, CheckCircle, XCircle, Send } from 'lucide-react';

export type DocumentFilter = 'all' | 'quotes' | 'invoices' | 'draft' | 'sent' | 'accepted' | 'paid' | 'overdue';

interface FilterTab {
  id: DocumentFilter;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

interface DocumentFilterTabsProps {
  activeFilter: DocumentFilter;
  onFilterChange: (filter: DocumentFilter) => void;
  counts: {
    all: number;
    quotes: number;
    invoices: number;
    draft: number;
    sent: number;
    accepted: number;
    paid: number;
    overdue: number;
  };
}

const DocumentFilterTabs: React.FC<DocumentFilterTabsProps> = ({
  activeFilter,
  onFilterChange,
  counts,
}) => {
  const tabs: FilterTab[] = [
    { id: 'all', label: 'All', icon: <FileText className="h-3.5 w-3.5" />, count: counts.all },
    { id: 'quotes', label: 'Quotes', icon: <FileText className="h-3.5 w-3.5" />, count: counts.quotes },
    { id: 'invoices', label: 'Invoices', icon: <Receipt className="h-3.5 w-3.5" />, count: counts.invoices },
    { id: 'draft', label: 'Draft', icon: <Clock className="h-3.5 w-3.5" />, count: counts.draft },
    { id: 'sent', label: 'Sent', icon: <Send className="h-3.5 w-3.5" />, count: counts.sent },
    { id: 'accepted', label: 'Accepted', icon: <CheckCircle className="h-3.5 w-3.5" />, count: counts.accepted },
    { id: 'paid', label: 'Paid', icon: <CheckCircle className="h-3.5 w-3.5" />, count: counts.paid },
    { id: 'overdue', label: 'Overdue', icon: <XCircle className="h-3.5 w-3.5" />, count: counts.overdue },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onFilterChange(tab.id)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
            activeFilter === tab.id
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {tab.icon}
          <span>{tab.label}</span>
          {tab.count !== undefined && tab.count > 0 && (
            <span className={cn(
              "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
              activeFilter === tab.id
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-background text-foreground"
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default DocumentFilterTabs;
