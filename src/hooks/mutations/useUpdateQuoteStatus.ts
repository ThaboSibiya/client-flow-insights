
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { QuoteInvoiceStatus } from '@/types/quote';
import { toast } from '@/hooks/use-toast';

export const useUpdateQuoteStatus = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const updateQuoteStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: QuoteInvoiceStatus }) => {
          if (!user) throw new Error('User not authenticated');
          
          const { data, error } = await supabase
            .from('quotes_invoices')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
          
          if (error) {
            console.error('Error updating quote status:', error);
            throw new Error(error.message);
          }
          return data;
        },
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: ['quotes_invoices'] });
          if (data) {
            toast({
                title: 'Status Updated',
                description: `Document status updated to "${data.status}".`,
            });
          }
        },
        onError: (error: Error) => {
          toast({
            title: 'Error',
            description: `Failed to update status: ${error.message}`,
            variant: 'destructive',
          });
        },
    });

    return {
        updateQuoteStatus: updateQuoteStatusMutation.mutateAsync,
        isUpdatingStatus: updateQuoteStatusMutation.isPending,
    };
}
