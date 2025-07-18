
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Mail, PenTool, Archive, Settings } from "lucide-react";
import { QuoteInvoice } from '@/types/quote';
import PDFGeneratorCard from './PDFGeneratorCard';
import EmailTrackingCard from './EmailTrackingCard';
import ESignatureCard from './ESignatureCard';
import DocumentArchiveCard from './DocumentArchiveCard';
import WorkflowSettingsCard from './WorkflowSettingsCard';

interface DocumentWorkflowManagerProps {
  quote: QuoteInvoice;
}

const DocumentWorkflowManager = ({ quote }: DocumentWorkflowManagerProps) => {
  const [activeTab, setActiveTab] = useState('pdf');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Document Workflow</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Workflow Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pdf" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            PDF Generation
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Tracking
          </TabsTrigger>
          <TabsTrigger value="signature" className="flex items-center gap-2">
            <PenTool className="h-4 w-4" />
            E-Signature
          </TabsTrigger>
          <TabsTrigger value="archive" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Archive
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pdf" className="mt-6">
          <PDFGeneratorCard quote={quote} />
        </TabsContent>

        <TabsContent value="email" className="mt-6">
          <EmailTrackingCard quote={quote} />
        </TabsContent>

        <TabsContent value="signature" className="mt-6">
          <ESignatureCard quote={quote} />
        </TabsContent>

        <TabsContent value="archive" className="mt-6">
          <DocumentArchiveCard quote={quote} />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <WorkflowSettingsCard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentWorkflowManager;
