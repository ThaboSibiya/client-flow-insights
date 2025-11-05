import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
