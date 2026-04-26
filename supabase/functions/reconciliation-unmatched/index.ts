import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = [
  'https://e1036b92-283a-4a65-9473-d759ed300ea1.lovableproject.com',
  'http://localhost:5173',
  'http://localhost:3000',
];

const getCorsHeaders = (origin: string | null) => {
  const isAllowed = origin && allowedOrigins.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  };
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching unmatched items for user:', user.id);

    // Get unmatched invoices (not fully paid)
    const { data: unmatchedInvoices, error: invError } = await supabaseClient
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['pending', 'sent', 'partial', 'overdue']);

    if (invError) {
      console.error('Error fetching invoices:', invError);
      throw invError;
    }

    // Get unmatched payments (no invoice_id or partial allocation)
    const { data: unmatchedPayments, error: payError } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .or('invoice_id.is.null,status.eq.pending');

    if (payError) {
      console.error('Error fetching payments:', payError);
      throw payError;
    }

    console.log(`Found ${unmatchedInvoices?.length || 0} unmatched invoices and ${unmatchedPayments?.length || 0} unmatched payments`);

    return new Response(JSON.stringify({ 
      unmatchedInvoices: unmatchedInvoices || [],
      unmatchedPayments: unmatchedPayments || [],
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in reconciliation-unmatched:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
