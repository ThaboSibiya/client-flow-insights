 import React, { useRef } from 'react';
 import { Card } from '@/components/ui/card';
 import { QuoteInvoice } from '@/types/quote';
 import { useCompanyProfile } from '@/hooks/useCompanyProfile';
 import { DocumentPreview } from './previews/DocumentPreview';
 import { DocumentPreviewActions } from './previews/DocumentPreviewActions';
 import { Skeleton } from '@/components/ui/skeleton';
 
 interface QuotePreviewProps {
   quote: QuoteInvoice | null;
 }
 
 const QuotePreview = ({ quote }: QuotePreviewProps) => {
   const { profile, loading } = useCompanyProfile();
   const previewRef = useRef<HTMLDivElement>(null);
 
   if (!quote) {
     return null;
   }
 
   if (loading) {
     return (
       <div className="space-y-4">
         <Skeleton className="h-10 w-48" />
         <Card className="p-8">
           <Skeleton className="h-96 w-full" />
         </Card>
       </div>
     );
   }
 
    return (
      <div className="space-y-3">
        {/* Compact header with actions only */}
        <div className="flex items-center justify-end">
          <DocumentPreviewActions quote={quote} />
        </div>
  
        {/* Document Preview - flex-driven height */}
        <Card className="overflow-hidden border">
          <div className="overflow-auto max-h-[calc(100vh-220px)] bg-muted/30">
            <DocumentPreview ref={previewRef} quote={quote} profile={profile} />
          </div>
        </Card>
      </div>
   );
 };
 
 export default QuotePreview;
