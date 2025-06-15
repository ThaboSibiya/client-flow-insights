
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { QuoteInvoice, QuoteInvoiceStatus, QuoteInvoiceType } from '@/types/quote';
import { toast } from '@/hooks/use-toast';

// Manual type definition for insertion
export interface QuoteInvoiceItemInsert {
  description: string;
  quantity: number;
  rate: number;
}
export interface QuoteInvoiceInsert {
  customer_id?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  type: QuoteInvoiceType;
  number: string;
  subject?: string | null;
  status: QuoteInvoiceStatus;
  issue_date: string;
  due_date?: string | null;
  valid_until?: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string | null;
  terms?: string | null;
  items: QuoteInvoiceItemInsert[];
}

export const useQuoteData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: quotes, isLoading, error } = useQuery({
    queryKey: ['quotes_invoices', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('quotes_invoices')
        .select('*, quote_invoice_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quotes/invoices:', error);
        throw new Error(error.message);
      }
      return data as QuoteInvoice[];
    },
    enabled: !!user,
  });

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
    quotes: quotes || [], 
    isLoading, 
    error, 
    createQuoteInvoice: createQuoteInvoiceMutation.mutateAsync 
  };
};
