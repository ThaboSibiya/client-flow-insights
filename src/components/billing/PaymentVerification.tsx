import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

const PaymentVerification: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { verifyPayment } = useSubscription();

  const paymentStatus = searchParams.get('payment');
  const reference = searchParams.get('reference') || searchParams.get('trxref');

  useEffect(() => {
    if (paymentStatus === 'success' && reference && !verifying && !verified && !error) {
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
  }, [paymentStatus, reference]);

  if (!paymentStatus) return null;

  if (verifying) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        <AlertDescription className="text-blue-700 ml-2">
          Verifying your payment with Paystack... Please wait.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-700 ml-2">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (verified) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-700 ml-2">
          Payment verified and subscription activated! 🎉
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default PaymentVerification;
