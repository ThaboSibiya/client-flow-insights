import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Expected path: /webhook-receiver/{endpoint_key}
    // The endpoint_key is the last part after 'webhook-receiver'
    const endpointKey = pathParts[pathParts.length - 1];
    
    if (!endpointKey || endpointKey === 'webhook-receiver') {
      return new Response(
        JSON.stringify({ error: 'Endpoint key required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Webhook received for endpoint: ${endpointKey}`);

    // Look up the API trigger by endpoint key
    const { data: trigger, error: triggerError } = await supabase
      .from('api_triggers')
      .select('*')
      .eq('endpoint_key', endpointKey)
      .single();

    if (triggerError || !trigger) {
      console.error('Trigger not found:', triggerError);
      return new Response(
        JSON.stringify({ error: 'Invalid webhook endpoint' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!trigger.is_active) {
      return new Response(
        JSON.stringify({ error: 'Webhook endpoint is inactive' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate method
    if (req.method !== trigger.method && trigger.method !== 'ANY') {
      return new Response(
        JSON.stringify({ error: `Method ${req.method} not allowed. Expected ${trigger.method}` }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    let payload = null;
    if (req.method !== 'GET') {
      try {
        payload = await req.json();
      } catch {
        payload = await req.text();
      }
    }

    console.log('Payload received:', JSON.stringify(payload));

    // Log the webhook call
    const { error: logError } = await supabase
      .from('webhook_logs')
      .insert({
        user_id: trigger.user_id,
        trigger_id: trigger.id,
        request_method: req.method,
        request_payload: payload,
        response_status: 200,
        success: true,
      });

    if (logError) {
      console.error('Failed to log webhook:', logError);
    }

    // Update trigger stats
    const { error: updateError } = await supabase
      .from('api_triggers')
      .update({
        trigger_count: trigger.trigger_count + 1,
        last_triggered_at: new Date().toISOString(),
      })
      .eq('id', trigger.id);

    if (updateError) {
      console.error('Failed to update trigger stats:', updateError);
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook received successfully',
        trigger_name: trigger.name,
        received_at: new Date().toISOString(),
        payload_received: !!payload,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
