
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useActiveWorkspaceId } from '@/hooks/useActiveWorkspaceId';
import { QuoteInvoice } from '@/types/quote';

export const useFetchQuotes = () => {
  const { user } = useAuth();
  const workspaceId = useActiveWorkspaceId();

  const { data: quotes, isLoading, error } = useQuery({
    queryKey: ['quotes_invoices', user?.id, workspaceId],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from('quotes_invoices')
        .select('*, quote_invoice_items(*)')
        .eq('user_id', user.id);

      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quotes/invoices:', error);
        throw new Error(error.message);
      }
      return data as QuoteInvoice[];
    },
    enabled: !!user,
  });

  return { 
    quotes: quotes || [], 
    isLoading, 
    error
  };
};
