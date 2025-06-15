
import React from 'react';
import { QuoteInvoice } from '@/types/quote';

// Type based on usage in original QuotePreview.tsx
interface CompanyProfile {
  company?: string | null;
  company_address?: string | null;
  company_email?: string | null;
  company_phone?: string | null;
  company_logo_url?: string | null;
}

interface QuotePreviewHeaderProps {
  quote: QuoteInvoice;
  profile: CompanyProfile | null;
}

export const QuotePreviewHeader = ({ quote, profile }: QuotePreviewHeaderProps) => {
  return (
    <div className="flex justify-between items-start mb-8">
      <div>
        <h1 className="text-3xl font-bold text-quikle-primary mb-2">
          {quote.type === 'quote' ? 'QUOTE' : 'INVOICE'}
        </h1>
        <p className="text-quikle-slate">
          {quote.number}
        </p>
      </div>
      <div className="text-right flex items-start gap-4">
        <div>
          <h2 className="text-xl font-semibold text-quikle-charcoal">{profile?.company || 'Your Company'}</h2>
          {profile?.company_address && <p className="text-quikle-slate whitespace-pre-wrap">{profile.company_address}</p>}
          {profile?.company_email && <p className="text-quikle-slate">{profile.company_email}</p>}
          {profile?.company_phone && <p className="text-quikle-slate">{profile.company_phone}</p>}
        </div>
        {profile?.company_logo_url && (
          <div className="w-24 h-24 flex items-center justify-center">
            <img src={profile.company_logo_url} alt="Company Logo" className="max-w-full max-h-full object-contain" />
          </div>
        )}
      </div>
    </div>
  );
};
