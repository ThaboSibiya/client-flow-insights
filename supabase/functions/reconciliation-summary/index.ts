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

    console.log('Fetching reconciliation summary for user:', user.id);

    // Get summary counts
    const { data: reconciliations, error: recError } = await supabaseClient
      .from('reconciliations')
      .select('reconciliation_status, matched_amount')
      .eq('created_by', user.id);

    if (recError) {
      console.error('Error fetching reconciliations:', recError);
      throw recError;
    }

    // Calculate summary
    const summary = {
      total: reconciliations?.length || 0,
      matched: reconciliations?.filter(r => r.reconciliation_status === 'matched').length || 0,
      partial: reconciliations?.filter(r => r.reconciliation_status === 'partial').length || 0,
      unmatched: reconciliations?.filter(r => r.reconciliation_status === 'unmatched').length || 0,
      totalMatchedAmount: reconciliations
        ?.filter(r => r.reconciliation_status === 'matched')
        .reduce((sum, r) => sum + Number(r.matched_amount), 0) || 0,
      totalPartialAmount: reconciliations
        ?.filter(r => r.reconciliation_status === 'partial')
        .reduce((sum, r) => sum + Number(r.matched_amount), 0) || 0,
    };

    console.log('Summary calculated:', summary);

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in reconciliation-summary:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
