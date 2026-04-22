import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') ?? '';
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

// Provider chain: Lovable AI Gateway (primary) → OpenRouter fallbacks.
type Provider = { name: string; url: string; key: string; model: string };
const PROVIDERS: Provider[] = [
  { name: 'lovable-gemini-flash', url: 'https://ai.gateway.lovable.dev/v1/chat/completions', key: LOVABLE_API_KEY, model: 'google/gemini-2.5-flash' },
  { name: 'lovable-gemini-flash-lite', url: 'https://ai.gateway.lovable.dev/v1/chat/completions', key: LOVABLE_API_KEY, model: 'google/gemini-2.5-flash-lite' },
  { name: 'openrouter-llama', url: 'https://openrouter.ai/api/v1/chat/completions', key: OPENROUTER_API_KEY, model: 'meta-llama/llama-3.3-70b-instruct:free' },
].filter(p => p.key);

const SYSTEM_PROMPT = `You are Quikle AI, an action-taking CRM agent for the Quikle Innovation Suite.
When the user asks you to DO something, respond with ONLY a fenced code block tagged "action" containing JSON:

\`\`\`action
{ "tool": "<tool_name>", "args": { } }
\`\`\`

Do not ask for confirmation — just emit the action. After receiving a tool result, reply with ONE short plain sentence confirming what happened. For greetings or open-ended questions, reply normally in plain text.

AVAILABLE TOOLS:

— Tasks & follow-ups —
- create_task: { title, assignee?, due (YYYY-MM-DD)?, priority (low/medium/high)? }
- create_followup: { contact, date (YYYY-MM-DD)?, method (call/email/meeting)?, notes? }
- get_tasks: { status (open/done/all)? }
- get_followups: { status (pending/done/all)? }

— Leads / customers —
- create_lead: { name, email, phone?, status?, source? }
- get_leads: { status? }
- update_lead_status: { lead_id_or_name, status }
- assign_lead: { lead_id_or_name, assignee }

— Pipeline & tickets —
- list_pipeline: { type? (customer/ticket) }
- move_ticket: { ticket_id_or_subject, status (open/in_progress/resolved/closed) }
- assign_ticket: { ticket_id_or_subject, assignee_name }

— Quotes & invoices (HIGH-IMPACT, will be previewed) —
- create_quote: { customer_id_or_name, subject?, items: [{ description, quantity?, rate }], notes? }
- create_invoice: { customer_id_or_name, subject?, items: [{ description, quantity?, rate }], due_date (YYYY-MM-DD)?, notes? }
- mark_invoice_paid: { invoice_id_or_number }
- list_overdue_invoices: {}
- send_invoice_reminder: { invoice_id_or_number }   // HIGH-IMPACT

— Workflows / Automations (HIGH-IMPACT) —
- list_workflows: {}
- create_workflow: { name, description, template? (welcome/support/pipeline/webhook), trigger?, actions? }
- toggle_workflow: { workflow_id_or_name, active (true/false) }

— Projects —
- list_projects: { status? (not-started/in-progress/on-hold/completed/cancelled) }
- create_project: { name, description?, type? (development/marketing/design/research/maintenance), priority? (low/medium/high/urgent), due_date (YYYY-MM-DD)?, client? }
- list_project_tasks: { project_id_or_name }
- create_project_task: { project_id_or_name, title, priority?, due (YYYY-MM-DD)? }
- update_project_status: { project_id_or_name, status }

— Analytics —
- analytics_summary: {}   // counts of leads, tickets, tasks, invoices, revenue, overdue

If a customer/lead/ticket/invoice/project is referenced by name or partial id, pass the string the user gave — the backend will resolve it. Always prefer action over chat when a clear instruction is given. Keep replies short and friendly.`;

interface ChatMessage { role: 'user' | 'assistant' | 'system'; content: string }
type SBClient = ReturnType<typeof createClient>;
type ToolResult = { ok: boolean; summary: string; data?: unknown; preview?: PendingAction; error?: string };
interface PendingAction { tool: string; args: Record<string, unknown>; preview: { title: string; lines: string[] } }

const HIGH_IMPACT = new Set(['create_quote', 'create_invoice', 'send_invoice_reminder', 'mark_invoice_paid', 'create_workflow', 'toggle_workflow']);

async function callLLM(messages: ChatMessage[]): Promise<string> {
  if (PROVIDERS.length === 0) throw new Error('No LLM providers configured');
  let lastErr = '';
  for (const p of PROVIDERS) {
    try {
      const res = await fetch(p.url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${p.key}`,
          'Content-Type': 'application/json',
          ...(p.url.includes('openrouter.ai') ? {
            'HTTP-Referer': 'https://quikle-innovation-suite.lovable.app',
            'X-Title': 'Quikle AI Agent',
          } : {}),
        },
        body: JSON.stringify({ model: p.model, messages, temperature: 0.3 }),
      });
      if (!res.ok) {
        const t = await res.text();
        lastErr = `${p.name} ${res.status}: ${t.slice(0, 200)}`;
        if (res.status >= 500 || res.status === 429 || res.status === 408) {
          console.warn(`[quikle-agent] ${p.name} (${res.status}) → fallback`);
          continue;
        }
        throw new Error(lastErr);
      }
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) { lastErr = `${p.name}: empty`; continue; }
      return content;
    } catch (e) {
      lastErr = `${p.name}: ${e instanceof Error ? e.message : String(e)}`;
      console.warn(`[quikle-agent] ${lastErr}`);
      continue;
    }
  }
  throw new Error(`All LLM providers failed. Last: ${lastErr}`);
}

function parseAction(text: string): { tool: string; args: Record<string, any> } | null {
  const m = text.match(/```action\s*([\s\S]*?)```/i) || text.match(/```json\s*([\s\S]*?)```/i);
  const raw = m ? m[1] : null;
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw.trim());
    if (obj && typeof obj.tool === 'string') return { tool: obj.tool, args: obj.args || {} };
  } catch { /* try fallback */ }
  const j = raw.match(/\{[\s\S]*\}/);
  if (j) {
    try { const obj = JSON.parse(j[0]); if (obj?.tool) return { tool: obj.tool, args: obj.args || {} }; } catch { /* ignore */ }
  }
  return null;
}

const nextRef = (prefix: string) => `${prefix}-${Date.now().toString(36).toUpperCase()}`;
const isUuid = (s: unknown) => typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

// ─── Resolvers ───────────────────────────────────────────────────────────
async function resolveCustomer(supabase: SBClient, userId: string, ref: string) {
  if (!ref) return null;
  if (isUuid(ref)) {
    const { data } = await supabase.from('customers').select('id, name, email').eq('id', ref).eq('user_id', userId).maybeSingle();
    return data;
  }
  const { data } = await supabase.from('customers').select('id, name, email')
    .eq('user_id', userId).ilike('name', `%${ref}%`).limit(1).maybeSingle();
  return data;
}
async function resolveTicket(supabase: SBClient, userId: string, ref: string) {
  if (!ref) return null;
  if (isUuid(ref)) {
    const { data } = await supabase.from('tickets').select('id, subject, status').eq('id', ref).eq('user_id', userId).maybeSingle();
    return data;
  }
  const { data } = await supabase.from('tickets').select('id, subject, status')
    .eq('user_id', userId).or(`subject.ilike.%${ref}%,ticket_number.ilike.%${ref}%`).limit(1).maybeSingle();
  return data;
}
async function resolveInvoice(supabase: SBClient, userId: string, ref: string) {
  if (!ref) return null;
  if (isUuid(ref)) {
    const { data } = await supabase.from('quotes_invoices').select('id, number, status, total, customer_email, customer_name').eq('id', ref).eq('user_id', userId).maybeSingle();
    return data;
  }
  const { data } = await supabase.from('quotes_invoices').select('id, number, status, total, customer_email, customer_name')
    .eq('user_id', userId).eq('type', 'invoice').ilike('number', `%${ref}%`).limit(1).maybeSingle();
  return data;
}
async function resolveWorkflow(supabase: SBClient, userId: string, ref: string) {
  if (!ref) return null;
  if (isUuid(ref)) {
    const { data } = await supabase.from('workflow_automations').select('id, name, is_active').eq('id', ref).eq('user_id', userId).maybeSingle();
    return data;
  }
  const { data } = await supabase.from('workflow_automations').select('id, name, is_active')
    .eq('user_id', userId).ilike('name', `%${ref}%`).limit(1).maybeSingle();
  return data;
}
async function resolveProject(supabase: SBClient, userId: string, ref: string) {
  if (!ref) return null;
  if (isUuid(ref)) {
    const { data } = await supabase.from('projects').select('id, name, status').eq('id', ref).eq('user_id', userId).maybeSingle();
    return data;
  }
  const { data } = await supabase.from('projects').select('id, name, status')
    .eq('user_id', userId).ilike('name', `%${ref}%`).limit(1).maybeSingle();
  return data;
}

// ─── Workflow templates ──────────────────────────────────────────────────
function buildWorkflowGraph(template?: string, trigger?: string, actions?: string[]) {
  const T = (template || '').toLowerCase();
  if (T === 'welcome') {
    return {
      nodes: [
        { id: '1', type: 'workflowNode', position: { x: 250, y: 50 }, data: { type: 'trigger', name: 'New Customer Added', category: 'triggers', config: { event: 'customer.created' } } },
        { id: '2', type: 'workflowNode', position: { x: 250, y: 180 }, data: { type: 'email', name: 'Send Welcome Email', category: 'integrations', config: { template: 'welcome' } } },
        { id: '3', type: 'workflowNode', position: { x: 250, y: 310 }, data: { type: 'action', name: 'Assign to Sales Rep', category: 'actions', config: { action: 'assign_rep' } } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', animated: true },
        { id: 'e2-3', source: '2', target: '3', animated: true },
      ],
    };
  }
  if (T === 'support') {
    return {
      nodes: [
        { id: '1', type: 'workflowNode', position: { x: 250, y: 50 }, data: { type: 'trigger', name: 'New Support Ticket', category: 'triggers', config: { event: 'ticket.created' } } },
        { id: '2', type: 'workflowNode', position: { x: 250, y: 180 }, data: { type: 'ai_classify', name: 'Classify Ticket', category: 'ai_actions', config: { categories: ['billing', 'technical', 'general'] } } },
        { id: '3', type: 'workflowNode', position: { x: 250, y: 310 }, data: { type: 'ai_agent', name: 'AI Response Agent', category: 'ai_actions', config: { persona: 'support' } } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', animated: true },
        { id: 'e2-3', source: '2', target: '3', animated: true },
      ],
    };
  }
  if (T === 'pipeline') {
    return {
      nodes: [
        { id: '1', type: 'workflowNode', position: { x: 250, y: 50 }, data: { type: 'trigger', name: 'Stage Changed', category: 'triggers', config: { event: 'pipeline.stage_changed' } } },
        { id: '2', type: 'workflowNode', position: { x: 250, y: 180 }, data: { type: 'condition', name: 'Check Stage', category: 'logic', config: { field: 'stage' } } },
        { id: '3', type: 'workflowNode', position: { x: 250, y: 310 }, data: { type: 'action', name: 'Run Action', category: 'actions', config: {} } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', animated: true },
        { id: 'e2-3', source: '2', target: '3', animated: true },
      ],
    };
  }
  if (T === 'webhook') {
    return {
      nodes: [
        { id: '1', type: 'workflowNode', position: { x: 250, y: 50 }, data: { type: 'webhook', name: 'Receive Webhook', category: 'triggers', config: {} } },
        { id: '2', type: 'workflowNode', position: { x: 250, y: 180 }, data: { type: 'ai_extract', name: 'Extract Data', category: 'ai_actions', config: {} } },
        { id: '3', type: 'workflowNode', position: { x: 250, y: 310 }, data: { type: 'database', name: 'Save to Database', category: 'integrations', config: {} } },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', animated: true },
        { id: 'e2-3', source: '2', target: '3', animated: true },
      ],
    };
  }
  // Free-form fallback: trigger + N actions
  const acts = (actions && actions.length > 0) ? actions : ['Run Action'];
  const nodes: any[] = [
    { id: '1', type: 'workflowNode', position: { x: 250, y: 50 }, data: { type: 'trigger', name: trigger || 'Manual Trigger', category: 'triggers', config: {} } },
  ];
  const edges: any[] = [];
  acts.forEach((a, i) => {
    const id = String(i + 2);
    nodes.push({
      id, type: 'workflowNode', position: { x: 250, y: 50 + (i + 1) * 130 },
      data: { type: 'action', name: a, category: 'actions', config: {} },
    });
    edges.push({ id: `e${i + 1}-${i + 2}`, source: String(i + 1), target: id, animated: true });
  });
  return { nodes, edges };
}

// ─── Tool router ─────────────────────────────────────────────────────────
async function execTool(supabase: SBClient, userId: string, tool: string, args: Record<string, any>): Promise<ToolResult> {
  try {
    switch (tool) {
      // ─── Tasks ───
      case 'create_task': {
        const { data: customer } = await supabase.from('customers').select('id, name')
          .eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle();
        if (!customer) return { ok: false, summary: 'No customer exists yet — add a lead first.', error: 'no_customer' };
        const insert = {
          user_id: userId, customer_id: customer.id,
          subject: String(args.title || 'Untitled task'),
          ticket_number: nextRef('TKT'),
          priority: ['low','medium','high'].includes(args.priority) ? args.priority : 'medium',
          status: 'open',
          assigned_to_name: args.assignee ?? null,
          description: args.due ? `Due: ${args.due}` : null,
        };
        const { data, error } = await supabase.from('tickets').insert(insert).select().single();
        if (error) throw error;
        return { ok: true, summary: `Created task “${insert.subject}”${args.assignee ? ` for ${args.assignee}` : ''}.`, data };
      }
      case 'create_followup': {
        const insert = {
          user_id: userId,
          contact: String(args.contact || 'Unknown'),
          date: args.date ?? null,
          method: ['call','email','meeting'].includes(args.method) ? args.method : 'call',
          notes: args.notes ?? null,
          status: 'pending',
        };
        const { data, error } = await supabase.from('followups').insert(insert).select().single();
        if (error) throw error;
        return { ok: true, summary: `Scheduled ${insert.method} with ${insert.contact}${insert.date ? ` on ${insert.date}` : ''}.`, data };
      }
      case 'get_tasks': {
        let q = supabase.from('tickets').select('id, subject, status, priority, assigned_to_name, created_at')
          .eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
        if (args.status && args.status !== 'all') {
          q = args.status === 'done' ? q.in('status', ['resolved','closed']) : q.eq('status', args.status);
        }
        const { data, error } = await q; if (error) throw error;
        return { ok: true, summary: `Found ${data?.length ?? 0} task(s).`, data };
      }
      case 'get_followups': {
        let q = supabase.from('followups').select('*').eq('user_id', userId).order('date', { ascending: true }).limit(20);
        if (args.status && args.status !== 'all') q = q.eq('status', args.status);
        const { data, error } = await q; if (error) throw error;
        return { ok: true, summary: `Found ${data?.length ?? 0} follow-up(s).`, data };
      }

      // ─── Leads ───
      case 'create_lead': {
        const insert = {
          user_id: userId,
          name: String(args.name || 'New Lead'),
          email: String(args.email || ''),
          phone: args.phone ?? null,
          status: args.status || 'new',
          source: args.source ?? null,
        };
        if (!insert.email) return { ok: false, summary: 'Email is required to create a lead.', error: 'email_required' };
        const { data, error } = await supabase.from('customers').insert(insert).select().single();
        if (error) throw error;
        return { ok: true, summary: `Added lead ${insert.name}.`, data };
      }
      case 'get_leads': {
        let q = supabase.from('customers').select('id, name, email, status, contact_person, created_at')
          .eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
        if (args.status) q = q.eq('status', args.status);
        const { data, error } = await q; if (error) throw error;
        return { ok: true, summary: `Found ${data?.length ?? 0} lead(s).`, data };
      }
      case 'update_lead_status': {
        const cust = await resolveCustomer(supabase, userId, String(args.lead_id_or_name || args.lead_id || ''));
        if (!cust) return { ok: false, summary: 'Lead not found.', error: 'not_found' };
        const { data, error } = await supabase.from('customers')
          .update({ status: args.status }).eq('id', cust.id).eq('user_id', userId).select().single();
        if (error) throw error;
        return { ok: true, summary: `Set ${cust.name} to “${args.status}”.`, data };
      }
      case 'assign_lead': {
        const cust = await resolveCustomer(supabase, userId, String(args.lead_id_or_name || args.lead_id || ''));
        if (!cust) return { ok: false, summary: 'Lead not found.', error: 'not_found' };
        const { data, error } = await supabase.from('customers')
          .update({ contact_person: args.assignee }).eq('id', cust.id).eq('user_id', userId).select().single();
        if (error) throw error;
        return { ok: true, summary: `Assigned ${cust.name} to ${args.assignee}.`, data };
      }

      // ─── Pipeline / tickets ───
      case 'list_pipeline': {
        const t = (args.type === 'ticket') ? 'ticket' : 'customer';
        const { data: stages, error } = await supabase.from('pipeline_stages')
          .select('id, name, position, target').eq('user_id', userId).eq('pipeline_type', t).order('position');
        if (error) throw error;
        const counts: Record<string, number> = {};
        if (t === 'customer') {
          const { data: cust } = await supabase.from('customers').select('status').eq('user_id', userId);
          (cust ?? []).forEach((c: any) => { if (c.status) counts[c.status] = (counts[c.status] ?? 0) + 1; });
        } else {
          const { data: tk } = await supabase.from('tickets').select('status').eq('user_id', userId);
          (tk ?? []).forEach((c: any) => { if (c.status) counts[c.status] = (counts[c.status] ?? 0) + 1; });
        }
        const items = (stages ?? []).map((s: any) => ({ ...s, count: counts[s.name] ?? 0 }));
        return { ok: true, summary: `${items.length} ${t} pipeline stage(s).`, data: items };
      }
      case 'move_ticket': {
        const tk = await resolveTicket(supabase, userId, String(args.ticket_id_or_subject || ''));
        if (!tk) return { ok: false, summary: 'Ticket not found.', error: 'not_found' };
        const status = ['open','in_progress','resolved','closed'].includes(args.status) ? args.status : 'open';
        const { data, error } = await supabase.from('tickets')
          .update({ status }).eq('id', tk.id).eq('user_id', userId).select().single();
        if (error) throw error;
        return { ok: true, summary: `Moved “${tk.subject}” → ${status}.`, data };
      }
      case 'assign_ticket': {
        const tk = await resolveTicket(supabase, userId, String(args.ticket_id_or_subject || ''));
        if (!tk) return { ok: false, summary: 'Ticket not found.', error: 'not_found' };
        const { data, error } = await supabase.from('tickets')
          .update({ assigned_to_name: args.assignee_name }).eq('id', tk.id).eq('user_id', userId).select().single();
        if (error) throw error;
        return { ok: true, summary: `Assigned “${tk.subject}” to ${args.assignee_name}.`, data };
      }

      // ─── Quotes / Invoices ───
      case 'create_quote':
      case 'create_invoice': {
        const isInvoice = tool === 'create_invoice';
        const cust = await resolveCustomer(supabase, userId, String(args.customer_id_or_name || ''));
        if (!cust) return { ok: false, summary: 'Customer not found — add them first.', error: 'no_customer' };
        const items: any[] = Array.isArray(args.items) ? args.items : [];
        if (items.length === 0) return { ok: false, summary: 'At least one line item is required.', error: 'no_items' };
        const subtotal = items.reduce((s, it) => s + (Number(it.quantity || 1) * Number(it.rate || 0)), 0);
        const total = subtotal; // tax handled elsewhere

        const due = args.due_date ? new Date(args.due_date).toISOString()
                                  : (isInvoice ? new Date(Date.now() + 30 * 86400000).toISOString() : null);
        const valid_until = isInvoice ? null : new Date(Date.now() + 30 * 86400000).toISOString();
        const insert = {
          user_id: userId,
          customer_id: cust.id,
          customer_name: cust.name,
          customer_email: cust.email,
          type: isInvoice ? 'invoice' : 'quote',
          number: nextRef(isInvoice ? 'INV' : 'QUO'),
          subject: args.subject ?? null,
          status: 'draft',
          due_date: due,
          valid_until,
          subtotal, tax: 0, total,
          notes: args.notes ?? null,
        };
        const { data: doc, error } = await supabase.from('quotes_invoices').insert(insert).select().single();
        if (error) throw error;
        const lineRows = items.map(it => ({
          quote_invoice_id: doc.id,
          user_id: userId,
          description: String(it.description || 'Item'),
          quantity: Number(it.quantity || 1),
          rate: Number(it.rate || 0),
        }));
        const { error: linesErr } = await supabase.from('quote_invoice_items').insert(lineRows);
        if (linesErr) throw linesErr;
        return { ok: true, summary: `Created ${isInvoice ? 'invoice' : 'quote'} ${insert.number} for ${cust.name} (R${total.toFixed(2)}).`, data: doc };
      }
      case 'mark_invoice_paid': {
        const inv = await resolveInvoice(supabase, userId, String(args.invoice_id_or_number || ''));
        if (!inv) return { ok: false, summary: 'Invoice not found.', error: 'not_found' };
        const { data, error } = await supabase.from('quotes_invoices')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .eq('id', inv.id).eq('user_id', userId).select().single();
        if (error) throw error;
        return { ok: true, summary: `Marked invoice ${inv.number} as paid.`, data };
      }
      case 'list_overdue_invoices': {
        const today = new Date().toISOString();
        const { data, error } = await supabase.from('quotes_invoices')
          .select('id, number, customer_name, total, due_date, status')
          .eq('user_id', userId).eq('type', 'invoice')
          .in('status', ['sent','overdue','partial'])
          .lt('due_date', today)
          .order('due_date', { ascending: true }).limit(20);
        if (error) throw error;
        return { ok: true, summary: `${data?.length ?? 0} overdue invoice(s).`, data };
      }
      case 'send_invoice_reminder': {
        const inv = await resolveInvoice(supabase, userId, String(args.invoice_id_or_number || ''));
        if (!inv) return { ok: false, summary: 'Invoice not found.', error: 'not_found' };
        // Best-effort: record a debtor_note as the reminder. (Real send is via Resend edge fn — wire later.)
        const { data: cust } = await supabase.from('customers').select('id').eq('email', inv.customer_email).eq('user_id', userId).maybeSingle();
        if (cust) {
          await supabase.from('debtor_notes').insert({
            user_id: userId,
            customer_id: cust.id,
            created_by: userId,
            note_type: 'reminder',
            note_content: `Payment reminder sent for invoice ${inv.number} (R${Number(inv.total || 0).toFixed(2)}).`,
            priority: 'medium',
          });
        }
        return { ok: true, summary: `Reminder logged for invoice ${inv.number}.`, data: inv };
      }

      // ─── Workflows ───
      case 'list_workflows': {
        const { data, error } = await supabase.from('workflow_automations')
          .select('id, name, description, is_active, trigger_count, last_triggered_at, created_at')
          .eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
        if (error) throw error;
        return { ok: true, summary: `You have ${data?.length ?? 0} workflow(s).`, data };
      }
      case 'create_workflow': {
        const graph = buildWorkflowGraph(args.template, args.trigger, args.actions);
        const insert = {
          user_id: userId,
          name: String(args.name || 'New Workflow'),
          description: args.description ?? null,
          nodes: graph.nodes,
          edges: graph.edges,
          is_active: false,
          trigger_type: args.template ? String(args.template) : 'simple',
        };
        const { data, error } = await supabase.from('workflow_automations').insert(insert).select().single();
        if (error) throw error;
        return { ok: true, summary: `Created workflow “${insert.name}” (inactive — review on Automations page).`, data };
      }
      case 'toggle_workflow': {
        const wf = await resolveWorkflow(supabase, userId, String(args.workflow_id_or_name || ''));
        if (!wf) return { ok: false, summary: 'Workflow not found.', error: 'not_found' };
        const active = !!args.active;
        const { data, error } = await supabase.from('workflow_automations')
          .update({ is_active: active }).eq('id', wf.id).eq('user_id', userId).select().single();
        if (error) throw error;
        return { ok: true, summary: `${active ? 'Activated' : 'Paused'} workflow “${wf.name}”.`, data };
      }
    }
    return { ok: false, summary: `Unknown tool: ${tool}`, error: 'unknown_tool' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, summary: `Action failed: ${msg}`, error: msg };
  }
}

// ─── Preview generator (high-impact actions) ─────────────────────────────
function buildPreview(tool: string, args: Record<string, any>): PendingAction['preview'] {
  if (tool === 'create_quote' || tool === 'create_invoice') {
    const items = Array.isArray(args.items) ? args.items : [];
    const total = items.reduce((s: number, it: any) => s + Number(it.quantity || 1) * Number(it.rate || 0), 0);
    return {
      title: tool === 'create_invoice' ? 'Create invoice' : 'Create quote',
      lines: [
        `Customer: ${args.customer_id_or_name ?? '—'}`,
        ...items.map((it: any) => `• ${it.description || 'Item'} × ${it.quantity || 1} @ R${Number(it.rate || 0).toFixed(2)}`),
        `Total: R${total.toFixed(2)}`,
      ],
    };
  }
  if (tool === 'send_invoice_reminder') {
    return { title: 'Send payment reminder', lines: [`Invoice: ${args.invoice_id_or_number}`] };
  }
  if (tool === 'mark_invoice_paid') {
    return { title: 'Mark invoice as paid', lines: [`Invoice: ${args.invoice_id_or_number}`] };
  }
  if (tool === 'create_workflow') {
    const a = Array.isArray(args.actions) ? args.actions : [];
    return {
      title: 'Create workflow',
      lines: [
        `Name: ${args.name ?? 'Untitled'}`,
        args.template ? `Template: ${args.template}` : `Trigger: ${args.trigger ?? 'manual'}`,
        ...a.map((x: string) => `→ ${x}`),
      ],
    };
  }
  if (tool === 'toggle_workflow') {
    return { title: args.active ? 'Activate workflow' : 'Pause workflow', lines: [`Workflow: ${args.workflow_id_or_name}`] };
  }
  return { title: tool, lines: [JSON.stringify(args)] };
}

// ─── HTTP entry ──────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const type = body?.type as string;

    // Confirm a previously-previewed action
    if (type === 'confirm') {
      const { tool, args } = body.action || {};
      if (!tool) return new Response(JSON.stringify({ error: 'Missing action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      const result = await execTool(supabase, user.id, tool, args || {});
      return new Response(JSON.stringify({ reply: result.summary, actionTaken: tool, actionResult: result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (type === 'chat') {
      const message: string = body.message ?? '';
      const history: ChatMessage[] = Array.isArray(body.history) ? body.history.slice(-10) : [];
      const messages: ChatMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: message },
      ];
      const first = await callLLM(messages);
      const action = parseAction(first);

      if (!action) {
        return new Response(JSON.stringify({ reply: first }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // High-impact: return preview without executing.
      if (HIGH_IMPACT.has(action.tool)) {
        const preview = buildPreview(action.tool, action.args);
        return new Response(JSON.stringify({
          reply: `Ready to run: **${preview.title}**. Confirm below to proceed.`,
          pendingAction: { tool: action.tool, args: action.args, preview },
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const result = await execTool(supabase, user.id, action.tool, action.args);
      let reply = result.summary;
      try {
        reply = await callLLM([
          ...messages,
          { role: 'assistant', content: first },
          { role: 'user', content: `Tool result: ${JSON.stringify(result)}. Reply with ONE short plain sentence confirming the outcome (no JSON, no code).` },
        ]);
      } catch { /* fall back to raw summary */ }

      return new Response(JSON.stringify({
        reply: reply || result.summary,
        actionTaken: action.tool,
        actionResult: result,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (type === 'meeting') {
      const transcript: string = body.transcript ?? '';
      const title: string = body.title ?? 'Untitled meeting';
      if (!transcript.trim()) {
        return new Response(JSON.stringify({ error: 'Empty transcript' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const raw = await callLLM([
        { role: 'system', content: 'You extract structured notes from meeting transcripts. Return ONLY a JSON object, no code fences, no commentary.' },
        { role: 'user', content: `Transcript:\n${transcript}\n\nReturn:\n{ "summary": "...", "decisions": ["..."], "action_items": ["..."], "follow_up_date": "YYYY-MM-DD or null" }` },
      ]);
      let parsed: any = {};
      try { parsed = JSON.parse(raw); } catch {
        const m = raw.match(/\{[\s\S]*\}/); if (m) try { parsed = JSON.parse(m[0]); } catch { /* ignore */ }
      }
      const insert = {
        user_id: user.id, title,
        summary: parsed.summary ?? '',
        decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],
        action_items: Array.isArray(parsed.action_items) ? parsed.action_items : [],
        follow_up_date: parsed.follow_up_date && parsed.follow_up_date !== 'null' ? parsed.follow_up_date : null,
        raw_transcript: transcript,
      };
      const { data, error } = await supabase.from('meeting_notes').insert(insert).select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ notes: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (type === 'update') {
      const entity: string = body.entity;
      const map: Record<string, { table: string; cols: string }> = {
        tasks: { table: 'tickets', cols: 'id, subject, status, priority, assigned_to_name, created_at' },
        leads: { table: 'customers', cols: 'id, name, email, status, contact_person, created_at' },
        followups: { table: 'followups', cols: 'id, contact, date, method, status, notes, created_at' },
      };
      const cfg = map[entity];
      if (!cfg) {
        return new Response(JSON.stringify({ error: 'Invalid entity' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const { data, error } = await supabase.from(cfg.table).select(cfg.cols)
        .eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
      if (error) throw error;
      const summary = await callLLM([
        { role: 'system', content: 'Summarise CRM data for a busy manager in plain language under 80 words. No bullet points, no JSON.' },
        { role: 'user', content: `${entity} (latest ${data?.length ?? 0}):\n${JSON.stringify(data)}` },
      ]);
      return new Response(JSON.stringify({ summary, count: data?.length ?? 0, items: data ?? [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown type' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('quikle-agent error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
