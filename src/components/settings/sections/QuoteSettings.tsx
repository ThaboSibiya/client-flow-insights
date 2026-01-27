
import React from 'react';
import { CompanyLogoUploader } from '@/components/quotes/CompanyLogoUploader';
import { CompanyProfileForm } from '@/components/quotes/CompanyProfileForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const QuoteSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-quikle-primary" />
            Quote & Invoice Settings
          </CardTitle>
          <CardDescription>
            Configure your default quote and invoice settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CompanyProfileForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Document Branding</CardTitle>
          <CardDescription>
            Upload your logo to appear on quotes and invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyLogoUploader />
        </CardContent>
      </Card>
    </div>
  );
};

export default QuoteSettings;
