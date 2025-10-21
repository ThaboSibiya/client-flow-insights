import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EmailConfirmationNoticeProps {
  email: string;
}

export const EmailConfirmationNotice: React.FC<EmailConfirmationNoticeProps> = ({ email }) => {
  const [resending, setResending] = useState(false);

  const handleResendConfirmation = async () => {
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        }
      });

      if (error) throw error;

      // Log resend attempt
      await supabase.from('security_events').insert({
        event_type: 'confirmation_email_resent',
        resource_type: 'user_account',
        metadata: {
          email: email,
          resent_at: new Date().toISOString()
        }
      });

      toast({
        title: "Confirmation email resent",
        description: "Please check your email inbox and spam folder",
      });
    } catch (error: any) {
      console.error('Resend error:', error);
      toast({
        title: "Error resending email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <Alert className="border-blue-200 bg-blue-50">
      <Mail className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-900">Check Your Email</AlertTitle>
      <AlertDescription className="text-blue-800">
        <p className="mb-3">
          We've sent a confirmation link to <strong>{email}</strong>
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
            <span>Check your inbox for an email from Quikle CRM</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
            <span>Don't forget to check your spam/junk folder</span>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
            <span>The confirmation link will expire in 24 hours</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResendConfirmation}
          disabled={resending}
          className="mt-4"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${resending ? 'animate-spin' : ''}`} />
          {resending ? 'Resending...' : 'Resend Confirmation Email'}
        </Button>
      </AlertDescription>
    </Alert>
  );
};
