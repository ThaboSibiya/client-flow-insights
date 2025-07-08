
import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import QuoteList from "@/components/quotes/QuoteList";
import ResponsiveQuoteManager from "@/components/quotes/ResponsiveQuoteManager";
import DocumentWorkflowManager from "@/components/quotes/workflow/DocumentWorkflowManager";
import RevenueOptimizationDashboard from "@/components/quotes/revenue/RevenueOptimizationDashboard";
import AutomationSettings from "@/components/quotes/AutomationSettings";
import AutoConversionSettings from "@/components/quotes/revenue/AutoConversionSettings";
import QuoteSettings from "@/components/quotes/QuoteSettings";
import QuotePreview from "@/components/quotes/QuotePreview";
import { QuoteInvoice, QuoteInvoiceInsert } from '@/types/quote';

interface QuoteInvoiceTabContentProps {
  activeTab: string;
  quotes: any[];
  isLoading: boolean;
  selectedQuote: QuoteInvoice | null;
  editingQuote: QuoteInvoice | null;
  onSelectQuote: (quote: QuoteInvoice) => void;
  onPreview: () => void;
  onEdit: (quote: QuoteInvoice) => void;
  onSave: (data: QuoteInvoiceInsert) => Promise<void>;
}

const QuoteInvoiceTabContent = ({
  activeTab,
  quotes,
  isLoading,
  selectedQuote,
  editingQuote,
  onSelectQuote,
  onPreview,
  onEdit,
  onSave
}: QuoteInvoiceTabContentProps) => {
  const EmptyState = ({ title, description }: { title: string; description: string }) => (
    <Card>
      <CardContent className="p-8 text-center">
        <FileText className="h-12 w-12 text-quikle-slate mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-quikle-charcoal mb-2">{title}</h3>
        <p className="text-quikle-slate">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <>
      <TabsContent value="quotes" className="mt-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ) : (
          <QuoteList 
            quotes={quotes}
            onSelectQuote={onSelectQuote} 
            onPreview={onPreview}
            onEdit={onEdit}
          />
        )}
      </TabsContent>

      <TabsContent value="create-quote" className="mt-6">
        <ResponsiveQuoteManager 
          onSave={onSave} 
          initialData={editingQuote?.type === 'quote' ? editingQuote : null}
          type="quote"
        />
      </TabsContent>

      <TabsContent value="create-invoice" className="mt-6">
        <ResponsiveQuoteManager 
          onSave={onSave} 
          initialData={editingQuote?.type === 'invoice' ? editingQuote : null}
          type="invoice"
        />
      </TabsContent>

      <TabsContent value="workflow" className="mt-6">
        {selectedQuote ? (
          <DocumentWorkflowManager quote={selectedQuote} />
        ) : (
          <EmptyState 
            title="No Quote Selected"
            description="Select a quote to manage its document workflow"
          />
        )}
      </TabsContent>

      <TabsContent value="revenue" className="mt-6">
        <RevenueOptimizationDashboard />
      </TabsContent>

      <TabsContent value="automation" className="mt-6">
        <AutomationSettings />
      </TabsContent>

      <TabsContent value="revenue-settings" className="mt-6">
        <AutoConversionSettings />
      </TabsContent>
      
      <TabsContent value="settings" className="mt-6">
        <QuoteSettings />
      </TabsContent>

      <TabsContent value="preview" className="mt-6">
        {selectedQuote ? (
          <QuotePreview quote={selectedQuote} />
        ) : (
          <EmptyState 
            title="No Quote Selected"
            description="Create a new quote or select an existing one to preview"
          />
        )}
      </TabsContent>
    </>
  );
};

export default QuoteInvoiceTabContent;
