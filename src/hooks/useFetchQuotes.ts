
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { QuoteInvoice } from '@/types/quote';

export const useFetchQuotes = () => {
  const { user } = useAuth();

  const { data: quotes = [], isLoading, error, refetch } = useQuery({
    queryKey: ['quotes_invoices', user?.id],
    queryFn: async (): Promise<QuoteInvoice[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('quotes_invoices')
        .select(`
          *,
          quote_invoice_items (
            id,
            description,
            quantity,
            rate,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quotes:', error);
        throw error;
      }

      return data as QuoteInvoice[];
    },
    enabled: !!user,
  });

  return {
    quotes,
    isLoading,
    error,
    refetch
  };
};
