
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, TrendingUp, Settings as SettingsIcon } from "lucide-react";

interface QuoteInvoiceTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const QuoteInvoiceTabs = ({ activeTab, onTabChange }: QuoteInvoiceTabsProps) => {
  return (
    <TabsList className="grid w-full grid-cols-9 bg-white border border-quikle-silver/20 shadow-sm p-1 h-auto">
      <TabsTrigger 
        value="quotes" 
        className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white text-xs px-2 py-2.5 font-medium"
      >
        All Quotes
      </TabsTrigger>
      <TabsTrigger 
        value="create-quote" 
        className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white text-xs px-2 py-2.5 font-medium"
      >
        Create Quote
      </TabsTrigger>
      <TabsTrigger 
        value="create-invoice" 
        className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white text-xs px-2 py-2.5 font-medium"
      >
        Create Invoice
      </TabsTrigger>
      <TabsTrigger 
        value="workflow" 
        className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white text-xs px-2 py-2.5 font-medium flex items-center gap-1"
      >
        <FileText className="h-3 w-3" />
        Workflow
      </TabsTrigger>
      <TabsTrigger 
        value="revenue" 
        className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white text-xs px-2 py-2.5 font-medium flex items-center gap-1"
      >
        <TrendingUp className="h-3 w-3" />
        Revenue
      </TabsTrigger>
      <TabsTrigger 
        value="automation" 
        className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white text-xs px-2 py-2.5 font-medium"
      >
        Automation
      </TabsTrigger>
      <TabsTrigger 
        value="revenue-settings" 
        className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white text-xs px-2 py-2.5 font-medium flex items-center gap-1"
      >
        <SettingsIcon className="h-3 w-3" />
        Rev Settings
      </TabsTrigger>
      <TabsTrigger 
        value="settings" 
        className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white text-xs px-2 py-2.5 font-medium"
      >
        Settings
      </TabsTrigger>
      <TabsTrigger 
        value="preview" 
        className="data-[state=active]:bg-quikle-primary data-[state=active]:text-white text-xs px-2 py-2.5 font-medium"
      >
        Preview
      </TabsTrigger>
    </TabsList>
  );
};

export default QuoteInvoiceTabs;
