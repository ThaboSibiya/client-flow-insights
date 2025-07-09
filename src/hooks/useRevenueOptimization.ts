
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { QuoteInvoice } from '@/types/quote';
import { toast } from '@/hooks/use-toast';

export const useRevenueOptimization = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const convertQuoteToInvoiceMutation = useMutation({
    mutationFn: async (quoteId: string): Promise<QuoteInvoice | null> => {
      if (!user) throw new Error('User not authenticated');

      // Fetch the original quote
      const { data: quote, error: fetchError } = await supabase
        .from('quotes_invoices')
        .select('*, quote_invoice_items(*)')
        .eq('id', quoteId)
        .eq('type', 'quote')
        .single();

      if (fetchError || !quote) {
        throw new Error('Quote not found');
      }

      // Create new invoice from quote
      const invoiceData = {
        ...quote,
        id: undefined,
        type: 'invoice' as const,
        status: 'draft' as const,
        number: `INV-${Date.now()}`,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: newInvoice, error: createError } = await supabase
        .from('quotes_invoices')
        .insert(invoiceData)
        .select()
        .single();

      if (createError || !newInvoice) {
        throw new Error('Failed to create invoice');
      }

      // Copy quote items to invoice
      const invoiceItems = quote.quote_invoice_items.map(item => ({
        ...item,
        id: undefined,
        quote_invoice_id: newInvoice.id,
        created_at: new Date().toISOString()
      }));

      const { error: itemsError } = await supabase
        .from('quote_invoice_items')
        .insert(invoiceItems);

      if (itemsError) {
        throw new Error('Failed to create invoice items');
      }

      return newInvoice as QuoteInvoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes_invoices'] });
      toast({
        title: 'Success',
        description: 'Quote converted to invoice successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: `Failed to convert quote: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    convertQuoteToInvoice: convertQuoteToInvoiceMutation.mutateAsync,
    isConverting: convertQuoteToInvoiceMutation.isPending,
  };
};
