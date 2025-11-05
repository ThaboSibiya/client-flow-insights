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

    const url = new URL(req.url);
    const customerId = url.pathname.split('/').pop();

    if (!customerId) {
      return new Response(JSON.stringify({ error: 'Customer ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching reconciliation history for customer:', customerId);

    // Get reconciliation history with related data
    const { data: history, error: histError } = await supabaseClient
      .from('reconciliations')
      .select(`
        *,
        invoices (
          invoice_number,
          total_amount,
          due_date,
          status
        ),
        payments (
          payment_number,
          amount,
          payment_date,
          payment_method,
          status
        )
      `)
      .eq('customer_id', customerId)
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (histError) {
      console.error('Error fetching history:', histError);
      throw histError;
    }

    // Get reconciliation notes for this customer
    const { data: notes, error: notesError } = await supabaseClient
      .from('reconciliation_notes')
      .select('*')
      .eq('customer_id', customerId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (notesError) {
      console.error('Error fetching notes:', notesError);
    }

    console.log(`Found ${history?.length || 0} reconciliation records`);

    return new Response(JSON.stringify({ 
      history: history || [],
      notes: notes || [],
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in reconciliation-history:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
