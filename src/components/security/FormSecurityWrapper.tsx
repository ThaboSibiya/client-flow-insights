
import React, { ReactNode, useEffect, useState } from 'react';
import { useCSRF } from './CSRFProtection';
import { useRateLimit } from '@/hooks/useRateLimit';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface FormSecurityWrapperProps {
  children: ReactNode;
  formName: string;
  onSubmit: (data: any, csrfToken: string) => Promise<void>;
  maxAttempts?: number;
  windowMs?: number;
}

export const FormSecurityWrapper: React.FC<FormSecurityWrapperProps> = ({
  children,
  formName,
  onSubmit,
  maxAttempts = 5,
  windowMs = 60000
}) => {
  const { token: csrfToken } = useCSRF();
  const { checkLimit, isBlocked, remainingAttempts, reset } = useRateLimit({
    resource: formName,
    maxAttempts,
    windowMs
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    if (isBlocked) {
      return;
    }

    const allowed = await checkLimit();
    if (!allowed) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(data, csrfToken);
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isBlocked) {
    return (
      <div className="max-w-md mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Too many attempts. Please wait a moment before trying again.
          </AlertDescription>
        </Alert>
        <Button 
          onClick={reset} 
          variant="outline" 
          className="mt-4 w-full"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      {remainingAttempts <= 2 && remainingAttempts > 0 && (
        <Alert className="mb-4">
          <AlertDescription>
            {remainingAttempts} attempts remaining before temporary lockout.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="relative">
        {isSubmitting && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <div className="text-sm">Submitting...</div>
          </div>
        )}
        
        {React.cloneElement(children as React.ReactElement, {
          onSubmit: handleSubmit,
          disabled: isSubmitting
        })}
      </div>
    </div>
  );
};
