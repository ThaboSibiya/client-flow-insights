
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { QuoteInvoice, QuoteInvoiceInsert } from '@/types/quote';
import { toast } from '@/hooks/use-toast';

export const useCreateQuote = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const createQuoteInvoiceMutation = useMutation({
        mutationFn: async (quoteData: QuoteInvoiceInsert): Promise<QuoteInvoice> => {
            if (!user) throw new Error('User not authenticated');
            
            const { items, ...quoteDetails } = quoteData;
    
            const { data: newQuote, error: quoteError } = await supabase
                .from('quotes_invoices')
                .insert({ ...quoteDetails, user_id: user.id })
                .select()
                .single();
    
            if (quoteError) {
                console.error('Error creating quote/invoice:', quoteError);
                throw new Error(quoteError.message);
            }
    
            if (!newQuote) throw new Error('Failed to create quote/invoice');
    
            if (items && items.length > 0) {
                const itemsToInsert = items.map(item => ({
                    ...item,
                    quote_invoice_id: newQuote.id,
                    user_id: user.id
                }));
                
                const { error: itemsError } = await supabase
                    .from('quote_invoice_items')
                    .insert(itemsToInsert);
    
                if (itemsError) {
                    console.error('Error creating quote items:', itemsError);
                    await supabase.from('quotes_invoices').delete().eq('id', newQuote.id);
                    throw new Error(itemsError.message);
                }
            }
            
            const { data: fullQuote, error: fullQuoteError } = await supabase
              .from('quotes_invoices')
              .select('*, quote_invoice_items(*)')
              .eq('id', newQuote.id)
              .single();
            
            if (fullQuoteError) {
              console.error('Error fetching full quote:', fullQuoteError);
              return { ...newQuote, quote_invoice_items: [] } as unknown as QuoteInvoice;
            }
    
            return fullQuote as QuoteInvoice;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotes_invoices'] });
            toast({
                title: 'Success',
                description: 'Document created successfully.',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        }
    });

    return {
        createQuoteInvoice: createQuoteInvoiceMutation.mutateAsync,
        isCreating: createQuoteInvoiceMutation.isPending,
    }
}
