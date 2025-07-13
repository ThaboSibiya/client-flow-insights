
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { QuoteInvoiceInsert } from '@/types/quote';
import { useAuth } from '@/context/AuthContext';

export const useCreateQuote = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createQuoteInvoiceMutation = useMutation({
    mutationFn: async (data: QuoteInvoiceInsert) => {
      if (!user) throw new Error('User not authenticated');

      // Create the quote/invoice
      const { data: quoteInvoice, error: quoteError } = await supabase
        .from('quotes_invoices')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select()
        .single();

      if (quoteError) throw quoteError;

      // Create the items
      if (data.items && data.items.length > 0) {
        const items = data.items.map(item => ({
          ...item,
          quote_invoice_id: quoteInvoice.id,
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
        description: `${data.type === 'quote' ? 'Quote' : 'Invoice'} created successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['quotes_invoices'] });
    },
    onError: (error: any) => {
      console.error('Error creating quote/invoice:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create quote/invoice",
        variant: "destructive",
      });
    },
  });

  return {
    createQuoteInvoice: createQuoteInvoiceMutation.mutateAsync,
    isLoading: createQuoteInvoiceMutation.isPending,
  };
};
