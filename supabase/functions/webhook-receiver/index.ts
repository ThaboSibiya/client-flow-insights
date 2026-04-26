import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = [
  'https://quikle-innovation-suite.lovable.app',
  'https://id-preview--e1036b92-283a-4a65-9473-d759ed300ea1.lovable.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

const getCorsHeaders = (origin: string | null) => {
  const isAllowed = origin && allowedOrigins.includes(origin);
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  };
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

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

    // ─── ROUTE by trigger name / endpoint_key ───
    const triggerName = (trigger.name || '').toLowerCase();

    let result: any;

    if (triggerName.includes('find') || triggerName.includes('search') || triggerName.includes('lookup')) {
      result = await handleFindContact(supabase, trigger, payload);
    } else if (triggerName.includes('update') || triggerName.includes('edit') || triggerName.includes('modify')) {
      result = await handleUpdateContact(supabase, trigger, payload);
    } else {
      result = await handleCreateContact(supabase, trigger, payload, endpointKey);
    }

    // ─── Log the webhook call ───
    await supabase.from('webhook_logs').insert({
      user_id: trigger.user_id,
      trigger_id: trigger.id,
      request_method: req.method,
      request_payload: payload,
      response_status: result.status,
      response_body: result.error || null,
      success: result.success,
      error_message: result.error || null,
    });

    // Update trigger stats using SQL increment to avoid race conditions
    await supabase.rpc('increment_trigger_count', { trigger_id: trigger.id });

    return new Response(
      JSON.stringify(result.body),
      { status: result.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ────────────────────────────────────────────────
// HANDLER: Find Contact (SELECT)
// ────────────────────────────────────────────────
async function handleFindContact(supabase: any, trigger: any, payload: any) {
  if (!payload || typeof payload !== 'object') {
    return {
      success: false,
      status: 400,
      error: 'Payload required with at least one search field',
      body: {
        success: false,
        error: 'Payload required',
        hint: 'Send JSON with at least one of: email, phone, name, customer_id',
        expected_schema: {
          email: 'string (optional)',
          phone: 'string (optional)',
          name: 'string (optional)',
          customer_id: 'string (optional, UUID)',
        },
      },
    };
  }

  const normalized = normalizeSearchPayload(payload);
  console.log('Find contact search params:', JSON.stringify(normalized));

  let query = supabase
    .from('customers')
    .select('id, name, email, phone, status, address, contact_person, notes, created_at, updated_at')
    .eq('user_id', trigger.user_id);

  // Search by customer_id first (exact match)
  if (normalized.customer_id) {
    query = query.eq('id', normalized.customer_id);
  } else if (normalized.email) {
    query = query.ilike('email', normalized.email);
  } else if (normalized.phone) {
    query = query.ilike('phone', `%${normalized.phone}%`);
  } else if (normalized.name) {
    query = query.ilike('name', `%${normalized.name}%`);
  } else {
    return {
      success: false,
      status: 400,
      error: 'At least one search field required',
      body: {
        success: false,
        error: 'No search criteria provided',
        hint: 'Provide at least one of: email, phone, name, customer_id',
      },
    };
  }

  const { data: customers, error: searchError } = await query.limit(10);

  if (searchError) {
    console.error('Search error:', searchError);
    return {
      success: false,
      status: 500,
      error: searchError.message,
      body: { success: false, error: 'Search failed', details: searchError.message },
    };
  }

  const count = customers?.length || 0;
  console.log(`Find contact returned ${count} result(s)`);

  return {
    success: true,
    status: 200,
    error: null,
    body: {
      success: true,
      count,
      customers: customers || [],
      ...(count === 1 ? { customer: customers[0] } : {}),
      trigger_name: trigger.name,
      searched_at: new Date().toISOString(),
    },
  };
}

// ────────────────────────────────────────────────
// HANDLER: Update Contact (UPDATE)
// ────────────────────────────────────────────────
async function handleUpdateContact(supabase: any, trigger: any, payload: any) {
  if (!payload || typeof payload !== 'object') {
    return {
      success: false,
      status: 400,
      error: 'Payload required with customer_id and fields to update',
      body: {
        success: false,
        error: 'Payload required',
        hint: 'Send JSON with customer_id (required) and fields to update',
        expected_schema: {
          customer_id: 'string (required, UUID)',
          name: 'string (optional)',
          email: 'string (optional)',
          phone: 'string (optional)',
          status: 'string (optional) — allowed: "new", "existing", "pending", "finalised" (case-insensitive, aliases supported)',
          address: 'string (optional)',
          contact_person: 'string (optional)',
          notes: 'string (optional)',
        },
        allowed_statuses: [...VALID_STATUSES],
      },
    };
  }

  const normalized = normalizeUpdatePayload(payload);
  console.log('Update contact params:', JSON.stringify(normalized));

  if (!normalized.customer_id) {
    return {
      success: false,
      status: 400,
      error: 'customer_id is required for updates',
      body: {
        success: false,
        error: 'Missing customer_id',
        hint: 'Include "customer_id" (UUID) in your payload to identify which contact to update.',
      },
    };
  }

  // Verify customer exists and belongs to this user
  const { data: existing, error: findError } = await supabase
    .from('customers')
    .select('id, name, email')
    .eq('id', normalized.customer_id)
    .eq('user_id', trigger.user_id)
    .maybeSingle();

  if (findError || !existing) {
    return {
      success: false,
      status: 404,
      error: 'Customer not found',
      body: {
        success: false,
        error: 'Customer not found',
        hint: `No customer with id "${normalized.customer_id}" found for this account.`,
      },
    };
  }

  // Build update fields
  const updateFields: Record<string, any> = {};
  if (normalized.name) updateFields.name = normalized.name;
  if (normalized.email) updateFields.email = normalized.email;
  if (normalized.phone) updateFields.phone = normalized.phone;
  if (normalized.status) {
    const statusResult = normalizeStatus(normalized.status);
    if (!statusResult.valid) {
      return {
        success: false,
        status: 400,
        error: `Invalid status value: "${normalized.status}"`,
        body: {
          success: false,
          error: `Invalid status value: "${normalized.status}"`,
          hint: 'Status is case-insensitive. Common aliases are auto-mapped.',
          allowed_values: [...VALID_STATUSES],
          alias_examples: {
            'new': ['new', 'lead', 'prospect', 'open'],
            'existing': ['existing', 'qualified', 'active', 'converted', 'customer', 'won'],
            'pending': ['pending', 'contacted', 'in progress', 'follow up', 'negotiation'],
            'finalised': ['finalised', 'finalized', 'closed', 'completed', 'done'],
          },
        },
      };
    }
    if (statusResult.value) updateFields.status = statusResult.value;
  }
  if (normalized.address) updateFields.address = normalized.address;
  if (normalized.contact_person) updateFields.contact_person = normalized.contact_person;
  if (normalized.notes) updateFields.notes = normalized.notes;
  if (normalized.company_address) updateFields.company_address = normalized.company_address;

  if (Object.keys(updateFields).length === 0) {
    return {
      success: false,
      status: 400,
      error: 'No fields to update',
      body: {
        success: false,
        error: 'No updatable fields provided',
        hint: 'Include at least one field to update: name, email, phone, status, address, contact_person, notes',
      },
    };
  }

  updateFields.updated_at = new Date().toISOString();

  const { data: updated, error: updateError } = await supabase
    .from('customers')
    .update(updateFields)
    .eq('id', normalized.customer_id)
    .eq('user_id', trigger.user_id)
    .select('id, name, email, phone, status, address, contact_person, notes, updated_at')
    .single();

  if (updateError) {
    console.error('Update error:', updateError);
    return {
      success: false,
      status: 500,
      error: updateError.message,
      body: { success: false, error: 'Update failed', details: updateError.message },
    };
  }

  // Log pipeline activity
  await supabase.from('pipeline_activity').insert({
    user_id: trigger.user_id,
    entity_id: normalized.customer_id,
    entity_type: 'customer',
    action_type: 'updated_via_webhook',
    pipeline_type: 'customer',
    metadata: {
      updated_fields: Object.keys(updateFields).filter(k => k !== 'updated_at'),
      trigger_name: trigger.name,
      source: 'webhook',
    },
  });

  console.log(`Updated customer: ${normalized.customer_id}`);

  return {
    success: true,
    status: 200,
    error: null,
    body: {
      success: true,
      message: 'Contact updated successfully',
      customer: updated,
      updated_fields: Object.keys(updateFields).filter(k => k !== 'updated_at'),
      trigger_name: trigger.name,
      updated_at: new Date().toISOString(),
    },
  };
}

// ────────────────────────────────────────────────
// HANDLER: Create Contact (INSERT) — original logic
// ────────────────────────────────────────────────
async function handleCreateContact(supabase: any, trigger: any, payload: any, endpointKey: string) {
  let customerResult: { id: string | null; created: boolean; error: string | null } = {
    id: null,
    created: false,
    error: null,
  };

  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const normalized = normalizePayload(payload);
    const customerName = normalized.name;
    const customerEmail = normalized.email;

    if (customerName && customerEmail) {
      // Deduplicate by email
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', trigger.user_id)
        .eq('email', customerEmail)
        .maybeSingle();

      if (existing) {
        const updateFields: Record<string, any> = {};
        if (normalized.phone) updateFields.phone = normalized.phone;
        if (normalized.status) {
          const statusResult = normalizeStatus(normalized.status);
          if (statusResult.valid && statusResult.value) updateFields.status = statusResult.value;
        }
        if (normalized.address) updateFields.address = normalized.address;
        if (normalized.reason) updateFields.reason = normalized.reason;
        if (normalized.source) updateFields.source = normalized.source;
        if (normalized.notes) {
          updateFields.notes = `[Webhook ${new Date().toISOString()}] Source: ${normalized.source || 'API'}\n${normalized.notes}`;
        }
        if (normalized.contact_person) updateFields.contact_person = normalized.contact_person;

        if (Object.keys(updateFields).length > 0) {
          await supabase.from('customers').update(updateFields).eq('id', existing.id);
        }

        customerResult = { id: existing.id, created: false, error: null };
        console.log(`Updated existing customer: ${existing.id}`);
      } else {
        const { data: newCustomer, error: insertError } = await supabase
          .from('customers')
          .insert({
            user_id: trigger.user_id,
            name: customerName,
            email: customerEmail,
            phone: normalized.phone || null,
            status: (() => {
              const s = normalizeStatus(normalized.status);
              return s.valid && s.value ? s.value : 'new';
            })(),
            address: normalized.address || null,
            contact_person: normalized.contact_person || null,
            reason: normalized.reason || null,
            source: normalized.source || null,
            notes: normalized.source ? `Lead source: ${normalized.source}` : 'Created via webhook',
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('Customer insert failed:', insertError);
          customerResult = { id: null, created: false, error: insertError.message };
        } else {
          customerResult = { id: newCustomer.id, created: true, error: null };
          console.log(`Created new customer: ${newCustomer.id}`);

          // Place into first pipeline stage
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
          }

          // ─── Notify owner about new lead ───
          const leadSource = normalized.source || 'Webhook';
          await supabase.from('user_notifications').insert({
            user_id: trigger.user_id,
            type: 'lead',
            title: `New Lead: ${customerName}`,
            message: `A new lead from ${leadSource} has been added.${normalized.reason ? ` Reason: ${normalized.reason}` : ''}`,
            link: '/customers',
            metadata: {
              customer_id: newCustomer.id,
              source: leadSource,
            },
          });

          // ─── Auto-create ticket from reason ───
          if (normalized.reason) {
            const ticketNumber = `TK-${Date.now().toString(36).toUpperCase()}`;
            await supabase.from('tickets').insert({
              user_id: trigger.user_id,
              customer_id: newCustomer.id,
              ticket_number: ticketNumber,
              subject: `[${leadSource}] ${customerName} — Inquiry`,
              description: normalized.reason,
              status: 'open',
              priority: 'medium',
            });
            console.log(`Auto-created ticket ${ticketNumber} from reason`);
          }
        }
      }
    } else {
      customerResult.error = 'Missing required fields: "name" and "email" are required.';
    }
  }

  if (customerResult.error) {
    return {
      success: false,
      status: 422,
      error: customerResult.error,
      body: {
        success: false,
        error: customerResult.error,
        hint: 'Ensure your payload includes "name" and "email". Optional: "phone", "status", "source", "address", "contact_person", "notes".',
        expected_schema: {
          name: 'string (required)',
          email: 'string (required)',
          phone: 'string (optional)',
          status: 'string (optional) — allowed: "new", "existing", "pending", "finalised" (case-insensitive, aliases like "qualified"→"existing" supported)',
          source: 'string (optional) — e.g. "Voice AI Agent", "Website", "Referral"',
          reason: 'string (optional) — AI summary of caller pain points or inquiry reason',
          address: 'string (optional)',
          contact_person: 'string (optional)',
          notes: 'string (optional)',
        },
        allowed_statuses: [...VALID_STATUSES],
      },
    };
  }

  return {
    success: true,
    status: 200,
    error: null,
    body: {
      success: true,
      message: customerResult.created
        ? 'Lead created successfully and added to pipeline'
        : customerResult.id
          ? 'Existing lead updated with new data'
          : 'Webhook received (no actionable data)',
      customer_id: customerResult.id,
      trigger_name: trigger.name,
      received_at: new Date().toISOString(),
    },
  };
}

// ────────────────────────────────────────────────
// STATUS VALIDATION & MAPPING
// ────────────────────────────────────────────────

const VALID_STATUSES = ['new', 'existing', 'pending', 'finalised'] as const;

/** Maps common external status terms to internal valid values */
const STATUS_ALIASES: Record<string, string> = {
  // "new" aliases
  'new': 'new',
  'new lead': 'new',
  'lead': 'new',
  'prospect': 'new',
  'open': 'new',
  // "existing" aliases
  'existing': 'existing',
  'qualified': 'existing',
  'active': 'existing',
  'converted': 'existing',
  'customer': 'existing',
  'client': 'existing',
  'won': 'existing',
  'closed won': 'existing',
  // "pending" aliases
  'pending': 'pending',
  'contacted': 'pending',
  'in progress': 'pending',
  'in_progress': 'pending',
  'follow up': 'pending',
  'follow_up': 'pending',
  'negotiation': 'pending',
  'nurturing': 'pending',
  // "finalised" aliases
  'finalised': 'finalised',
  'finalized': 'finalised',
  'closed': 'finalised',
  'completed': 'finalised',
  'done': 'finalised',
  'archived': 'finalised',
  'closed lost': 'finalised',
};

/**
 * Validates and normalizes a status value.
 * Returns the valid status string, or null if invalid.
 * Case-insensitive with alias support.
 */
function normalizeStatus(raw: string | null | undefined): { value: string | null; valid: boolean; original: string | null } {
  if (!raw) return { value: null, valid: true, original: null };
  
  const cleaned = raw.toString().trim().toLowerCase();
  
  // Direct match
  if ((VALID_STATUSES as readonly string[]).includes(cleaned)) {
    return { value: cleaned, valid: true, original: raw };
  }
  
  // Alias match
  if (STATUS_ALIASES[cleaned]) {
    return { value: STATUS_ALIASES[cleaned], valid: true, original: raw };
  }
  
  // Invalid
  return { value: null, valid: false, original: raw };
}

// ────────────────────────────────────────────────
// NORMALIZERS
// ────────────────────────────────────────────────

/** Normalize search payload keys */
function normalizeSearchPayload(raw: Record<string, any>): Record<string, string | null> {
  let data = raw;
  if (raw.record && typeof raw.record === 'object') data = raw.record;
  else if (raw.data && typeof raw.data === 'object') data = raw.data;
  else if (raw.query && typeof raw.query === 'object') data = raw.query;
  else if (raw.search && typeof raw.search === 'object') data = raw.search;

  const lower: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    lower[key.toLowerCase().replace(/[\s-]/g, '_')] = value;
  }

  return {
    customer_id: lower.customer_id || lower.id || lower.contact_id || null,
    email: lower.email || lower.email_address || lower.customer_email || null,
    phone: lower.phone || lower.phone_number || lower.mobile || lower.telephone || null,
    name: lower.name || lower.full_name || lower.customer_name || lower.lead_name || null,
  };
}

/** Normalize update payload keys */
function normalizeUpdatePayload(raw: Record<string, any>): Record<string, string | null> {
  let data = raw;
  if (raw.record && typeof raw.record === 'object') data = { ...raw.record, customer_id: raw.customer_id || raw.record.customer_id };
  else if (raw.data && typeof raw.data === 'object') data = { ...raw.data, customer_id: raw.customer_id || raw.data.customer_id };

  const lower: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    lower[key.toLowerCase().replace(/[\s-]/g, '_')] = value;
  }

  return {
    customer_id: lower.customer_id || lower.id || lower.contact_id || null,
    name: lower.name || lower.full_name || lower.customer_name || null,
    email: lower.email || lower.email_address || null,
    phone: lower.phone || lower.phone_number || lower.mobile || null,
    status: lower.status || lower.lead_status || null,
    address: lower.address || lower.company_address || lower.location || null,
    contact_person: lower.contact_person || lower.contact || null,
    notes: lower.notes || lower.message || lower.description || lower.comments || null,
    company_address: lower.company_address || null,
  };
}

/** Normalize create payload keys (original) */
function normalizePayload(raw: Record<string, any>): Record<string, string | null> {
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
        reason: lower.reason || lower.pain_point || lower.inquiry_reason || lower.call_reason || null,
        address: lower.address || lower.company_address || lower.location || null,
        contact_person: lower.contact_person || lower.contact || null,
        notes: lower.notes || lower.message || lower.description || lower.comments || null,
      };
}
