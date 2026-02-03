import React from 'react';
import { QuoteInvoice, QuoteInvoiceType } from '@/types/quote';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Eye, Settings, Workflow, TrendingUp } from 'lucide-react';
import QuotePreview from '../QuotePreview';
import DocumentWorkflowManager from '../workflow/DocumentWorkflowManager';
import RevenueOptimizationDashboard from '../revenue/RevenueOptimizationDashboard';
import AutomationSettings from '../AutomationSettings';
import QuoteSettings from '../QuoteSettings';
import DocumentEmptyState from './DocumentEmptyState';

interface DocumentDetailPanelProps {
  document: QuoteInvoice | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreateNew: (type: QuoteInvoiceType) => void;
}

const DocumentDetailPanel: React.FC<DocumentDetailPanelProps> = ({
  document,
  activeTab,
  onTabChange,
  onCreateNew,
}) => {
  if (!document && activeTab === 'preview') {
    return <DocumentEmptyState onCreateNew={onCreateNew} />;
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={onTabChange} className="flex-1 flex flex-col">
        <div className="border-b border-border px-4">
          <TabsList className="h-12 bg-transparent p-0 gap-1">
            <TabsTrigger 
              value="preview" 
              className="data-[state=active]:bg-muted rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger 
              value="workflow" 
              disabled={!document}
              className="data-[state=active]:bg-muted rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Workflow className="h-4 w-4 mr-2" />
              Workflow
            </TabsTrigger>
            <TabsTrigger 
              value="revenue" 
              className="data-[state=active]:bg-muted rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Revenue
            </TabsTrigger>
            <TabsTrigger 
              value="automation" 
              className="data-[state=active]:bg-muted rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Settings className="h-4 w-4 mr-2" />
              Automation
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-muted rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <FileText className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <TabsContent value="preview" className="mt-0 h-full">
            {document ? (
              <QuotePreview quote={document} />
            ) : (
              <DocumentEmptyState onCreateNew={onCreateNew} />
            )}
          </TabsContent>

          <TabsContent value="workflow" className="mt-0">
            {document ? (
              <DocumentWorkflowManager quote={document} />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Select a document to manage its workflow
              </div>
            )}
          </TabsContent>

          <TabsContent value="revenue" className="mt-0">
            <RevenueOptimizationDashboard />
          </TabsContent>

          <TabsContent value="automation" className="mt-0">
            <AutomationSettings />
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <QuoteSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default DocumentDetailPanel;
