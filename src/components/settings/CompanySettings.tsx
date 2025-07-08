
import React from 'react';
import { CompanyProfileForm } from '@/components/quotes/CompanyProfileForm';
import { CompanyLogoUploader } from '@/components/quotes/CompanyLogoUploader';

const CompanySettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-quikle-charcoal mb-2">Company Profile</h3>
        <p className="text-sm text-quikle-slate mb-4">
          Manage your company information that appears on quotes, invoices, and communications.
        </p>
        <CompanyProfileForm />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-quikle-charcoal mb-2">Company Logo</h3>
        <p className="text-sm text-quikle-slate mb-4">
          Upload your company logo to appear on documents and communications.
        </p>
        <CompanyLogoUploader />
      </div>
    </div>
  );
};

export default CompanySettings;
