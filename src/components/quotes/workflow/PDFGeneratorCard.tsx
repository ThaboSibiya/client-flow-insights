
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Eye, Loader2, Palette } from "lucide-react";
import { QuoteInvoice } from '@/types/quote';
import { usePDFGeneration } from '@/hooks/usePDFGeneration';

interface PDFGeneratorCardProps {
  quote: QuoteInvoice;
}

const PDFGeneratorCard = ({ quote }: PDFGeneratorCardProps) => {
  const { generatePDF, downloadHTML, isGenerating } = usePDFGeneration();
  const [includeBranding, setIncludeBranding] = useState(true);
  const [template, setTemplate] = useState('professional');
  const [watermark, setWatermark] = useState(false);

  const handleGeneratePDF = () => {
    generatePDF(quote, {
      includeBranding,
      template: template as any,
      watermark
    });
  };

  const handlePreviewPDF = () => {
    downloadHTML(quote, {
      includeBranding,
      template: template as any,
      watermark
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          PDF Generation with Company Branding
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Include Company Branding</Label>
              <Switch
                checked={includeBranding}
                onCheckedChange={setIncludeBranding}
              />
            </div>

            <div className="space-y-2">
              <Label>PDF Template</Label>
              <Select value={template} onValueChange={setTemplate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Add Watermark</Label>
              <Switch
                checked={watermark}
                onCheckedChange={setWatermark}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Document Info</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Type: {quote.type === 'quote' ? 'Quote' : 'Invoice'}</p>
                <p>Number: {quote.number}</p>
                <p>Customer: {quote.customer_name}</p>
                <p>Total: R {quote.total}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={includeBranding ? "default" : "secondary"}>
                <Palette className="h-3 w-3 mr-1" />
                {includeBranding ? 'Branded' : 'Plain'}
              </Badge>
              <Badge variant="outline">{template}</Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleGeneratePDF} 
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isGenerating ? 'Generating...' : 'Generate PDF'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handlePreviewPDF}
            disabled={isGenerating}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview HTML
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFGeneratorCard;
