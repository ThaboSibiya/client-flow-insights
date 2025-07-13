
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { QuoteInvoiceInsert, QuoteInvoice } from '@/types/quote';
import { toast } from '@/hooks/use-toast';

interface UpdateQuoteParams {
  id: string;
  quoteData: QuoteInvoiceInsert;
}

export const useUpdateQuote = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, quoteData }: UpdateQuoteParams): Promise<QuoteInvoice> => {
      if (!user) throw new Error('User not authenticated');

      // Update the quote/invoice
      const { data: quote, error: quoteError } = await supabase
        .from('quotes_invoices')
        .update({
          ...quoteData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Delete existing items
      const { error: deleteError } = await supabase
        .from('quote_invoice_items')
        .delete()
        .eq('quote_invoice_id', id);

      if (deleteError) throw deleteError;

      // Create new items
      if (quoteData.items && quoteData.items.length > 0) {
        const itemsToInsert = quoteData.items.map(item => ({
          quote_invoice_id: id,
          user_id: user.id,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          created_at: new Date().toISOString()
        }));

        const { error: itemsError } = await supabase
          .from('quote_invoice_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      // Fetch the complete updated quote with items
      const { data: completeQuote, error: fetchError } = await supabase
        .from('quotes_invoices')
        .select('*, quote_invoice_items(*)')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return completeQuote as QuoteInvoice;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotes_invoices'] });
      toast({
        title: "Success",
        description: `${data.type} updated successfully`
      });
    },
    onError: (error: any) => {
      console.error('Error updating quote/invoice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update quote/invoice",
        variant: "destructive"
      });
    }
  });

  return {
    updateQuoteInvoice: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error
  };
};
