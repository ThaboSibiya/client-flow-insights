
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface InvitationSenderProps {
  employee: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    is_invited?: boolean;
    invitation_sent_at?: string;
    invitation_expires_at?: string;
  };
  companyName: string;
  onInvitationSent: () => void;
}

const InvitationSender = ({ employee, companyName, onInvitationSent }: InvitationSenderProps) => {
  const [sending, setSending] = useState(false);

  const sendInvitation = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-employee-invitation', {
        body: {
          employeeId: employee.id,
          email: employee.email,
          firstName: employee.first_name,
          lastName: employee.last_name,
          companyName: companyName
        }
      });

      if (error) throw error;

      toast({
        title: "Invitation Sent",
        description: `Invitation email sent to ${employee.email}`,
      });

      onInvitationSent();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const isExpired = employee.invitation_expires_at && 
    new Date(employee.invitation_expires_at) < new Date();

  const getInvitationStatus = () => {
    if (!employee.is_invited) {
      return (
        <Badge variant="outline" className="text-gray-600">
          <AlertCircle className="h-3 w-3 mr-1" />
          Not Invited
        </Badge>
      );
    }

    if (isExpired) {
      return (
        <Badge variant="destructive">
          <Clock className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="text-blue-600 border-blue-200">
        <CheckCircle className="h-3 w-3 mr-1" />
        Invited
      </Badge>
    );
  };

  return (
    <div className="flex items-center gap-3">
      {getInvitationStatus()}
      
      {(!employee.is_invited || isExpired) && (
        <Button
          onClick={sendInvitation}
          disabled={sending}
          size="sm"
          className="bg-quikle-primary hover:bg-quikle-secondary"
        >
          <Mail className="h-4 w-4 mr-2" />
          {sending ? 'Sending...' : isExpired ? 'Resend Invitation' : 'Send Invitation'}
        </Button>
      )}

      {employee.is_invited && !isExpired && employee.invitation_sent_at && (
        <div className="text-sm text-gray-500">
          Sent: {new Date(employee.invitation_sent_at).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default InvitationSender;
