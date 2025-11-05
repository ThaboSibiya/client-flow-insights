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

    const { reconciliationId, flagReason, priority = 'normal' } = await req.json();

    if (!reconciliationId || !flagReason) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Flagging reconciliation:', reconciliationId, 'reason:', flagReason);

    // Get reconciliation details
    const { data: reconciliation, error: recError } = await supabaseClient
      .from('reconciliations')
      .select('*, invoices(*), payments(*)')
      .eq('id', reconciliationId)
      .eq('created_by', user.id)
      .single();

    if (recError || !reconciliation) {
      throw new Error('Reconciliation not found or unauthorized');
    }

    // Create a reconciliation note for the flag
    const { error: noteError } = await supabaseClient
      .from('reconciliation_notes')
      .insert({
        user_id: user.id,
        invoice_id: reconciliation.invoice_id,
        payment_id: reconciliation.payment_id,
        customer_id: reconciliation.customer_id,
        note_type: 'flag',
        note_content: flagReason,
        priority,
        is_system_generated: false,
        metadata: {
          reconciliation_id: reconciliationId,
          flagged_at: new Date().toISOString(),
        },
      });

    if (noteError) {
      console.error('Error creating note:', noteError);
      throw noteError;
    }

    // Update reconciliation metadata to mark as flagged
    const { error: updateError } = await supabaseClient
      .from('reconciliations')
      .update({
        metadata: {
          ...reconciliation.metadata,
          flagged: true,
          flag_reason: flagReason,
          flag_priority: priority,
          flagged_at: new Date().toISOString(),
        },
      })
      .eq('id', reconciliationId);

    if (updateError) {
      console.error('Error updating reconciliation:', updateError);
      throw updateError;
    }

    console.log('Reconciliation flagged successfully');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Reconciliation flagged for review',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in reconciliation-flag:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
