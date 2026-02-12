import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
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
    let payload: any = null;
    if (req.method !== 'GET') {
      try {
        payload = await req.json();
      } catch {
        try {
          payload = await req.text();
        } catch {
          payload = null;
        }
      }
    }

    console.log('Payload received:', JSON.stringify(payload));

    // ─── PROCESS THE PAYLOAD: Insert into customers table ───
    let customerResult: { id: string | null; created: boolean; error: string | null } = {
      id: null,
      created: false,
      error: null,
    };

    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      // Extract fields with case-insensitive mapping
      const normalized = normalizePayload(payload);

      const customerName = normalized.name;
      const customerEmail = normalized.email;

      if (customerName && customerEmail) {
        // Check for duplicate by email under this user
        const { data: existing } = await supabase
          .from('customers')
          .select('id')
          .eq('user_id', trigger.user_id)
          .eq('email', customerEmail)
          .maybeSingle();

        if (existing) {
          // Update existing customer with any new data
          const updateFields: Record<string, any> = {};
          if (normalized.phone) updateFields.phone = normalized.phone;
          if (normalized.status) updateFields.status = normalized.status;
          if (normalized.address) updateFields.address = normalized.address;
          if (normalized.notes) {
            updateFields.notes = `[Webhook ${new Date().toISOString()}] Source: ${normalized.source || 'API'}\n${normalized.notes}`;
          }
          if (normalized.contact_person) updateFields.contact_person = normalized.contact_person;

          if (Object.keys(updateFields).length > 0) {
            await supabase
              .from('customers')
              .update(updateFields)
              .eq('id', existing.id);
          }

          customerResult = { id: existing.id, created: false, error: null };
          console.log(`Updated existing customer: ${existing.id}`);
        } else {
          // Insert new customer
          const { data: newCustomer, error: insertError } = await supabase
            .from('customers')
            .insert({
              user_id: trigger.user_id,
              name: customerName,
              email: customerEmail,
              phone: normalized.phone || null,
              status: normalized.status || 'active',
              address: normalized.address || null,
              contact_person: normalized.contact_person || null,
              notes: normalized.source
                ? `Lead source: ${normalized.source}`
                : 'Created via webhook',
            })
            .select('id')
            .single();

          if (insertError) {
            console.error('Customer insert failed:', insertError);
            customerResult = { id: null, created: false, error: insertError.message };
          } else {
            customerResult = { id: newCustomer.id, created: true, error: null };
            console.log(`Created new customer: ${newCustomer.id}`);

            // ─── Place customer into the first pipeline stage ───
            const { data: defaultStage } = await supabase
              .from('pipeline_stages')
              .select('id')
              .eq('user_id', trigger.user_id)
              .eq('pipeline_type', 'customer')
              .order('position', { ascending: true })
              .limit(1)
              .maybeSingle();

            if (defaultStage) {
              await supabase.from('pipeline_activity').insert({
                user_id: trigger.user_id,
                entity_id: newCustomer.id,
                entity_type: 'customer',
                action_type: 'created_via_webhook',
                pipeline_type: 'customer',
                to_stage_id: defaultStage.id,
                metadata: {
                  source: normalized.source || 'webhook',
                  trigger_name: trigger.name,
                  endpoint_key: endpointKey,
                },
              });
              console.log(`Pipeline activity logged for stage: ${defaultStage.id}`);
            }
          }
        }
      } else {
        customerResult.error = 'Missing required fields: "name" and "email" are required.';
        console.warn('Payload missing name or email:', JSON.stringify(payload));
      }
    }

    // ─── Log the webhook call ───
    const webhookSuccess = customerResult.error === null && (customerResult.id !== null || !payload);
    await supabase.from('webhook_logs').insert({
      user_id: trigger.user_id,
      trigger_id: trigger.id,
      request_method: req.method,
      request_payload: payload,
      response_status: webhookSuccess ? 200 : 422,
      response_body: customerResult.error || null,
      success: webhookSuccess,
      error_message: customerResult.error || null,
    });

    // Update trigger stats
    await supabase
      .from('api_triggers')
      .update({
        trigger_count: (trigger.trigger_count || 0) + 1,
        last_triggered_at: new Date().toISOString(),
      })
      .eq('id', trigger.id);

    // ─── Build response ───
    if (customerResult.error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: customerResult.error,
          hint: 'Ensure your payload includes "name" (string) and "email" (string). Optional: "phone", "status", "source", "address", "contact_person", "notes".',
          expected_schema: {
            name: 'string (required)',
            email: 'string (required)',
            phone: 'string (optional)',
            status: 'string (optional, default: "active")',
            source: 'string (optional)',
            address: 'string (optional)',
            contact_person: 'string (optional)',
            notes: 'string (optional)',
          },
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: customerResult.created
          ? 'Lead created successfully and added to pipeline'
          : customerResult.id
            ? 'Existing lead updated with new data'
            : 'Webhook received (no actionable data)',
        customer_id: customerResult.id,
        trigger_name: trigger.name,
        received_at: new Date().toISOString(),
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

/**
 * Normalize payload keys to lowercase for case-insensitive field mapping.
 * Supports both flat and nested ({ record: {...}, data: {...} }) payloads.
 */
function normalizePayload(raw: Record<string, any>): Record<string, string | null> {
  // Unwrap common nesting patterns
  let data = raw;
  if (raw.record && typeof raw.record === 'object') data = raw.record;
  else if (raw.data && typeof raw.data === 'object') data = raw.data;
  else if (raw.lead && typeof raw.lead === 'object') data = raw.lead;
  else if (raw.payload && typeof raw.payload === 'object') data = raw.payload;

  const lower: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    lower[key.toLowerCase().replace(/[\s-]/g, '_')] = value;
  }

  return {
    name: lower.name || lower.full_name || lower.customer_name || lower.lead_name || null,
    email: lower.email || lower.email_address || lower.customer_email || null,
    phone: lower.phone || lower.phone_number || lower.mobile || lower.telephone || null,
    status: lower.status || lower.lead_status || null,
    source: lower.source || lower.lead_source || lower.utm_source || lower.channel || null,
    address: lower.address || lower.company_address || lower.location || null,
    contact_person: lower.contact_person || lower.contact || null,
    notes: lower.notes || lower.message || lower.description || lower.comments || null,
  };
}
