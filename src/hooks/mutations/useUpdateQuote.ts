
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { QuoteInvoiceInsert } from '@/types/quote';
import { useAuth } from '@/context/AuthContext';

export const useUpdateQuote = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const updateQuoteInvoiceMutation = useMutation({
    mutationFn: async ({ id, quoteData }: { id: string; quoteData: QuoteInvoiceInsert }) => {
      if (!user) throw new Error('User not authenticated');

      // Update the quote/invoice
      const { data: quoteInvoice, error: quoteError } = await supabase
        .from('quotes_invoices')
        .update({
          ...quoteData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Delete existing items
      await supabase
        .from('quote_invoice_items')
        .delete()
        .eq('quote_invoice_id', id);

      // Create new items
      if (quoteData.items && quoteData.items.length > 0) {
        const items = quoteData.items.map(item => ({
          ...item,
          quote_invoice_id: id,
          user_id: user.id,
        }));

        const { error: itemsError } = await supabase
          .from('quote_invoice_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }

      return quoteInvoice;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `${data.type === 'quote' ? 'Quote' : 'Invoice'} updated successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['quotes_invoices'] });
    },
    onError: (error: any) => {
      console.error('Error updating quote/invoice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update quote/invoice",
        variant: "destructive",
      });
    },
  });

  return {
    updateQuoteInvoice: updateQuoteInvoiceMutation.mutateAsync,
    isLoading: updateQuoteInvoiceMutation.isPending,
  };
};
