import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useWorkspaceSubscription } from '@/hooks/useWorkspaceSubscription';

const PaymentVerification: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { verifyPayment } = useWorkspaceSubscription();

  const reference = searchParams.get('reference') || searchParams.get('trxref');

  useEffect(() => {
    if (reference && !verifying && !verified && !error) {
      setVerifying(true);
      setError(null);
      verifyPayment.mutateAsync(reference).then(() => {
        setVerified(true);
        setVerifying(false);
        setTimeout(() => {
          setSearchParams({});
        }, 5000);
      }).catch((err) => {
        setVerifying(false);
        setError(err.message || 'Verification failed. Please contact support.');
      });
    }
  }, [reference]);

  if (!reference && !verifying && !verified && !error) return null;

  if (verifying) {
    return (
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-700 dark:text-blue-300 ml-2">
          Verifying your payment with Paystack... Please wait.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert className="border-destructive/30 bg-destructive/5">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <AlertDescription className="text-destructive ml-2">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (verified) {
    return (
      <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertDescription className="text-green-700 dark:text-green-300 ml-2">
          Payment verified and subscription activated! 🎉
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default PaymentVerification;
