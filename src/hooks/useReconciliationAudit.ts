import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useReconciliationAudit = () => {
  const { user } = useAuth();

  const logReconciliationAction = async (
    actionType: 'match' | 'partial' | 'flag' | 'unmatch',
    details: {
      invoiceId?: string;
      paymentId?: string;
      customerId?: string;
      invoiceNumber?: string;
      paymentNumber?: string;
      amount?: number;
      reason?: string;
    }
  ) => {
    if (!user) return;

    try {
      const noteContent = generateNoteContent(actionType, details);
      
      await supabase.from('reconciliation_notes').insert({
        user_id: user.id,
        customer_id: details.customerId || null,
        invoice_id: details.invoiceId || null,
        payment_id: details.paymentId || null,
        note_type: actionType,
        note_content: noteContent,
        created_by: user.email || 'System',
        priority: actionType === 'flag' ? 'high' : 'normal',
        is_system_generated: true,
        metadata: {
          action_type: actionType,
          invoice_number: details.invoiceNumber,
          payment_number: details.paymentNumber,
          amount: details.amount,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error logging reconciliation action:', error);
    }
  };

  const generateNoteContent = (
    actionType: string,
    details: any
  ): string => {
    switch (actionType) {
      case 'match':
        return `✅ Successfully matched Invoice ${details.invoiceNumber} with Payment ${details.paymentNumber} for $${details.amount?.toLocaleString()}`;
      case 'partial':
        return `⚠️ Partial payment recorded for Invoice ${details.invoiceNumber}. Amount: $${details.amount?.toLocaleString()}`;
      case 'flag':
        return `🚩 Item flagged for review. Reason: ${details.reason || 'Manual review required'}`;
      case 'unmatch':
        return `↩️ Unmatched Invoice ${details.invoiceNumber} from Payment ${details.paymentNumber}`;
      default:
        return `Record updated`;
    }
  };

  return { logReconciliationAction };
};
