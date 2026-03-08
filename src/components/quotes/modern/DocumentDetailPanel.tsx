import React from 'react';
import { QuoteInvoice, QuoteInvoiceType } from '@/types/quote';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Activity, BarChart3 } from 'lucide-react';
import QuotePreview from '../QuotePreview';
import DocumentActivityTimeline from '../activity/DocumentActivityTimeline';
import CompactInsightsPanel from '../insights/CompactInsightsPanel';
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
  // Redirect legacy tab values to valid ones
  const validTabs = ['preview', 'activity', 'insights'];
  const safeTab = validTabs.includes(activeTab) ? activeTab : 'preview';

  if (!document && safeTab === 'preview') {
    return <DocumentEmptyState onCreateNew={onCreateNew} />;
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs value={safeTab} onValueChange={onTabChange} className="flex-1 flex flex-col">
        <div className="border-b border-border px-4">
          <TabsList className="h-11 bg-transparent p-0 gap-1">
            <TabsTrigger
              value="preview"
              className="data-[state=active]:bg-muted rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary text-sm"
            >
              <Eye className="h-4 w-4 mr-1.5" />
              Preview
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              disabled={!document}
              className="data-[state=active]:bg-muted rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary text-sm"
            >
              <Activity className="h-4 w-4 mr-1.5" />
              Activity
            </TabsTrigger>
            <TabsTrigger
              value="insights"
              className="data-[state=active]:bg-muted rounded-t-md rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary text-sm"
            >
              <BarChart3 className="h-4 w-4 mr-1.5" />
              Insights
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <TabsContent value="preview" className="mt-0 h-full">
            {document ? (
              <QuotePreview quote={document} />
            ) : (
              <DocumentEmptyState onCreateNew={onCreateNew} />
            )}
          </TabsContent>

          <TabsContent value="activity" className="mt-0">
            {document ? (
              <DocumentActivityTimeline quote={document} />
            ) : (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Select a document to view its activity
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="mt-0">
            <CompactInsightsPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default DocumentDetailPanel;
