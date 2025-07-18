
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { QuoteInvoice, QuoteInvoiceInsert } from '@/types/quote';
import { toast } from '@/hooks/use-toast';

export const useUpdateQuote = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const updateQuoteInvoiceMutation = useMutation({
        mutationFn: async ({ id, quoteData }: { id: string, quoteData: QuoteInvoiceInsert }): Promise<QuoteInvoice> => {
            if (!user) throw new Error('User not authenticated');
    
            const { items, ...quoteDetails } = quoteData;
    
            const { data: updatedQuote, error: quoteError } = await supabase
                .from('quotes_invoices')
                .update({ ...quoteDetails, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();
    
            if (quoteError) {
                console.error('Error updating quote/invoice:', quoteError);
                throw new Error(quoteError.message);
            }
    
            if (!updatedQuote) throw new Error('Failed to update quote/invoice');
    
            // Delete existing items
            const { error: deleteError } = await supabase
                .from('quote_invoice_items')
                .delete()
                .eq('quote_invoice_id', id);
    
            if (deleteError) {
                console.error('Error deleting old quote items:', deleteError);
                // A transaction in a db function would be more robust.
            }
    
            if (items && items.length > 0) {
                const itemsToInsert = items.map(item => ({
                    ...item,
                    quote_invoice_id: updatedQuote.id,
                    user_id: user.id
                }));
                
                const { error: itemsError } = await supabase
                    .from('quote_invoice_items')
                    .insert(itemsToInsert);
    
                if (itemsError) {
                    console.error('Error inserting new quote items:', itemsError);
                    // Consider a more robust rollback strategy
                    throw new Error(itemsError.message);
                }
            }
            
            const { data: fullQuote, error: fullQuoteError } = await supabase
              .from('quotes_invoices')
              .select('*, quote_invoice_items(*)')
              .eq('id', updatedQuote.id)
              .single();
            
            if (fullQuoteError) {
              console.error('Error fetching full updated quote:', fullQuoteError);
              return { ...updatedQuote, quote_invoice_items: [] } as unknown as QuoteInvoice;
            }
    
            return fullQuote as QuoteInvoice;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quotes_invoices'] });
            toast({
                title: 'Success',
                description: 'Document updated successfully.',
            });
        },
        onError: (error: Error) => {
            toast({
                title: 'Error',
                description: `Failed to update: ${error.message}`,
                variant: 'destructive',
            });
        }
    });

    return {
        updateQuoteInvoice: updateQuoteInvoiceMutation.mutateAsync,
        isUpdating: updateQuoteInvoiceMutation.isPending,
    }
}
