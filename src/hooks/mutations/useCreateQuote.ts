
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { QuoteInvoiceInsert, QuoteInvoice } from '@/types/quote';
import { toast } from '@/hooks/use-toast';

export const useCreateQuote = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (quoteData: QuoteInvoiceInsert): Promise<QuoteInvoice> => {
      if (!user) throw new Error('User not authenticated');

      // Create the quote/invoice
      const { data: quote, error: quoteError } = await supabase
        .from('quotes_invoices')
        .insert({
          ...quoteData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Create the items
      if (quoteData.items && quoteData.items.length > 0) {
        const itemsToInsert = quoteData.items.map(item => ({
          quote_invoice_id: quote.id,
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

      // Fetch the complete quote with items
      const { data: completeQuote, error: fetchError } = await supabase
        .from('quotes_invoices')
        .select('*, quote_invoice_items(*)')
        .eq('id', quote.id)
        .single();

      if (fetchError) throw fetchError;

      return completeQuote as QuoteInvoice;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['quotes_invoices'] });
      toast({
        title: "Success",
        description: `${data.type} created successfully`
      });
    },
    onError: (error: any) => {
      console.error('Error creating quote/invoice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create quote/invoice",
        variant: "destructive"
      });
    }
  });

  return {
    createQuoteInvoice: mutation.mutate,
    isCreating: mutation.isPending,
    error: mutation.error
  };
};
