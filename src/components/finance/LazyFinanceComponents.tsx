import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Lazy load heavy components
const TransactionLedger = lazy(() => import('./TransactionLedger'));
const DebtorNotesPanel = lazy(() => import('./DebtorNotesPanel'));

// Loading fallback component
const LoadingFallback = () => (
  <Card>
    <CardContent className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </CardContent>
  </Card>
);

// Lazy-loaded TransactionLedger wrapper
export const LazyTransactionLedger = (props: any) => (
  <Suspense fallback={<LoadingFallback />}>
    <TransactionLedger {...props} />
  </Suspense>
);

// Lazy-loaded DebtorNotesPanel wrapper
export const LazyDebtorNotesPanel = (props: any) => (
  <Suspense fallback={<LoadingFallback />}>
    <DebtorNotesPanel {...props} />
  </Suspense>
);
