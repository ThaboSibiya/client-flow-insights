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

// Provider chain: OpenRouter free-tier models only. Lovable AI Gateway has
// been removed to guarantee zero token cost. `freeOnly` is retained for
// signature compatibility but is effectively always true.
type Provider = { name: string; url: string; key: string; model: string; free: boolean };
const ALL_PROVIDERS: Provider[] = [
  { name: 'openrouter-deepseek-free', url: 'https://openrouter.ai/api/v1/chat/completions', key: OPENROUTER_API_KEY, model: 'deepseek/deepseek-v4-flash:free', free: true },
  { name: 'openrouter-llama-free', url: 'https://openrouter.ai/api/v1/chat/completions', key: OPENROUTER_API_KEY, model: 'meta-llama/llama-3.3-70b-instruct:free', free: true },
  { name: 'openrouter-nemotron-free', url: 'https://openrouter.ai/api/v1/chat/completions', key: OPENROUTER_API_KEY, model: 'nvidia/nemotron-3-super-120b-a12b:free', free: true },
  { name: 'openrouter-qwen-free', url: 'https://openrouter.ai/api/v1/chat/completions', key: OPENROUTER_API_KEY, model: 'qwen/qwen3-next-80b-a3b-instruct:free', free: true },
  { name: 'openrouter-gpt-oss-free', url: 'https://openrouter.ai/api/v1/chat/completions', key: OPENROUTER_API_KEY, model: 'openai/gpt-oss-120b:free', free: true },
].filter(p => p.key);

function getProviders(_freeOnly: boolean): Provider[] {
  return ALL_PROVIDERS;
}

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
- schedule_meeting: { contact, date (YYYY-MM-DD), notes? }   // HIGH-IMPACT
- log_note: { customer_id_or_name, note, tag? (general/follow_up/reminder/payment) }
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

— Memory (personalization) —
- remember: { content, kind? (preference/fact/style) }   // saves a fact about the user/workspace
- forget: { id }   // removes a memory by id

If a customer/lead/ticket/invoice/project is referenced by name or partial id, pass the string the user gave — the backend will resolve it. Always prefer action over chat when a clear instruction is given. Keep replies short and friendly. When the user states a stable preference ("I prefer WhatsApp", "we never call on Fridays", "always cc Sarah"), call \`remember\` to save it.`;

interface ChatMessage { role: 'user' | 'assistant' | 'system'; content: string }
type SBClient = ReturnType<typeof createClient>;
type ToolResult = { ok: boolean; summary: string; data?: unknown; preview?: PendingAction; error?: string };
interface PendingAction { tool: string; args: Record<string, unknown>; preview: { title: string; lines: string[] } }

const HIGH_IMPACT = new Set(['create_quote', 'create_invoice', 'send_invoice_reminder', 'send_payment_reminder', 'mark_invoice_paid', 'create_workflow', 'toggle_workflow', 'schedule_meeting']);

// Server-side access gate. Owners (no employee row) pass. Employees must have
// can_use_ai_agent !== false. Mirrors useAIAgentAccess on the client.
async function checkAgentAccess(supabase: SBClient, userId: string): Promise<{ ok: boolean; reason?: string }> {
  try {
    const { data: emp } = await supabase
      .from('employees')
      .select('id, role')
      .eq('auth_user_id', userId)
      .maybeSingle();
    if (!emp) return { ok: true }; // owner / standalone user
    const role = (emp as any).role?.toLowerCase?.();
    if (role === 'admin') return { ok: true };
    const { data: priv } = await supabase
      .from('employee_privileges')
      .select('can_use_ai_agent')
      .eq('employee_id', (emp as any).id)
      .maybeSingle();
    if (priv && (priv as any).can_use_ai_agent === false) {
      return { ok: false, reason: 'Ask your administrator for AI Agent access.' };
    }
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

// In-memory cooldown to skip recently-throttled providers (per isolate, ~minutes).
// This eliminates the 1–2s wasted per request on free-tier 429s.
const providerCooldownUntil = new Map<string, number>();
const COOLDOWN_MS = 60_000;

async function callLLM(
  messages: ChatMessage[],
  freeOnly = false,
  opts: { maxTokens?: number; temperature?: number } = {},
): Promise<string> {
  const all = getProviders(freeOnly);
  if (all.length === 0) {
    throw new Error(freeOnly
      ? 'Free-only mode enabled but no OpenRouter free providers configured. Add OPENROUTER_API_KEY.'
      : 'No LLM providers configured');
  }
  const now = Date.now();
  // Try non-cooled-down providers first; keep cooled ones as a last resort.
  const fresh = all.filter(p => (providerCooldownUntil.get(p.name) ?? 0) <= now);
  const cooled = all.filter(p => (providerCooldownUntil.get(p.name) ?? 0) > now);
  const providers = fresh.length ? [...fresh, ...cooled] : all;

  const temperature = opts.temperature ?? 0.3;
  const maxTokens = opts.maxTokens;

  let lastErr = '';
  for (const p of providers) {
    try {
      const body: Record<string, unknown> = { model: p.model, messages, temperature };
      if (maxTokens) body.max_tokens = maxTokens;
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
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const t = await res.text();
        lastErr = `${p.name} ${res.status}: ${t.slice(0, 200)}`;
        if (res.status === 429 || res.status === 408 || res.status >= 500) {
          providerCooldownUntil.set(p.name, Date.now() + COOLDOWN_MS);
          console.warn(`[quikle-agent] ${p.name} (${res.status}) → cooldown ${COOLDOWN_MS}ms, fallback`);
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

async function isFreeOnly(supabase: SBClient, userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('company_settings')
      .select('value')
      .eq('user_id', userId)
      .eq('key', 'ai_agent_free_only')
      .maybeSingle();
    const v = (data?.value as { value?: unknown } | null)?.value;
    return v === true || v === 'true';
  } catch {
    return false;
  }
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
    // Normalize common arg aliases produced by the LLM
    args = { ...(args || {}) };
    const alias = (from: string, to: string) => {
      if (args[to] === undefined && args[from] !== undefined) args[to] = args[from];
    };
    // customer/lead reference aliases
    ['customer_name','customer','lead_name','lead','contact_name','name_or_id','customer_id']
      .forEach((k) => alias(k, 'customer_id_or_name'));
    ['lead_id','lead_name','lead','customer_name','customer','name_or_id']
      .forEach((k) => alias(k, 'lead_id_or_name'));
    // note aliases
    alias('note_content', 'note');
    alias('content', 'note');
    alias('body', 'note');
    // task aliases
    alias('description', 'title');
    alias('subject', 'title');
    alias('due_date', 'due');
    alias('due_at', 'due');
    // followup aliases
    alias('contact_name', 'contact');
    alias('customer_name', 'contact');
    alias('lead_name', 'contact');
    alias('when', 'date');
    alias('scheduled_for', 'date');

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
      case 'send_invoice_reminder':
      case 'send_payment_reminder': {
        const inv = await resolveInvoice(supabase, userId, String(args.invoice_id_or_number || ''));
        if (!inv) return { ok: false, summary: 'Invoice not found.', error: 'not_found' };
        const { data: cust } = await supabase.from('customers').select('id').eq('email', inv.customer_email).eq('user_id', userId).maybeSingle();
        let emailed = false;
        if (cust) {
          await supabase.from('debtor_notes').insert({
            user_id: userId,
            customer_id: cust.id,
            created_by: userId,
            note_type: 'reminder',
            note_content: `Payment reminder sent for invoice ${inv.number} (R${Number(inv.total || 0).toFixed(2)}).`,
            priority: 'medium',
          });
          // Best-effort: trigger the existing statement-email edge function as the reminder delivery.
          try {
            const { error: mailErr } = await supabase.functions.invoke('customer-email-statement', {
              body: { customerId: cust.id, recipientEmail: inv.customer_email },
            });
            emailed = !mailErr;
          } catch { /* swallow — note already logged */ }
        }
        return {
          ok: true,
          summary: emailed
            ? `Emailed payment reminder for invoice ${inv.number} to ${inv.customer_email}.`
            : `Reminder logged for invoice ${inv.number} (email delivery skipped).`,
          data: inv,
        };
      }

      case 'log_note': {
        const cust = await resolveCustomer(supabase, userId, String(args.customer_id_or_name || ''));
        if (!cust) return { ok: false, summary: 'Customer not found.', error: 'not_found' };
        const allowedTags = ['general','follow_up','reminder','payment'];
        const tag = allowedTags.includes(args.tag) ? args.tag : 'general';
        const note = String(args.note || '').trim();
        if (!note) return { ok: false, summary: 'Note content is required.', error: 'empty_note' };
        const { data, error } = await supabase.from('debtor_notes').insert({
          user_id: userId,
          customer_id: cust.id,
          created_by: userId,
          note_type: tag,
          note_content: note,
          priority: 'medium',
        }).select().single();
        if (error) throw error;
        return { ok: true, summary: `Logged note on ${cust.name}.`, data };
      }

      case 'schedule_meeting': {
        const contact = String(args.contact || '').trim();
        if (!contact) return { ok: false, summary: 'Contact name is required.', error: 'no_contact' };
        const cust = await resolveCustomer(supabase, userId, contact);
        const insert = {
          user_id: userId,
          contact: cust?.name ?? contact,
          customer_id: cust?.id ?? null,
          date: args.date ?? null,
          method: 'meeting',
          notes: args.notes ?? null,
          status: 'pending',
        };
        const { data, error } = await supabase.from('followups').insert(insert).select().single();
        if (error) throw error;
        return { ok: true, summary: `Scheduled meeting with ${insert.contact}${insert.date ? ` on ${insert.date}` : ''}.`, data };
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

      // ─── Projects ───
      case 'list_projects': {
        let q = supabase.from('projects').select('id, name, status, priority, progress, due_date, client')
          .eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
        if (args.status) q = q.eq('status', args.status);
        const { data, error } = await q; if (error) throw error;
        return { ok: true, summary: `Found ${data?.length ?? 0} project(s).`, data };
      }
      case 'create_project': {
        const insert = {
          user_id: userId,
          name: String(args.name || 'New Project'),
          description: args.description ?? '',
          type: ['development','marketing','design','research','maintenance'].includes(args.type) ? args.type : 'development',
          priority: ['low','medium','high','urgent'].includes(args.priority) ? args.priority : 'medium',
          status: 'not-started',
          start_date: new Date().toISOString(),
          due_date: args.due_date ? new Date(args.due_date).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString(),
          budget: 0, spent: 0, progress: 0,
          owner_id: userId, owner_name: '', owner_email: '',
          team: [], tags: [],
          client: args.client ?? null,
        };
        const { data, error } = await supabase.from('projects').insert(insert).select().single();
        if (error) throw error;
        return { ok: true, summary: `Created project “${insert.name}”.`, data };
      }
      case 'list_project_tasks': {
        const proj = await resolveProject(supabase, userId, String(args.project_id_or_name || ''));
        if (!proj) return { ok: false, summary: 'Project not found.', error: 'not_found' };
        const { data, error } = await supabase.from('project_tasks')
          .select('id, title, status, priority, due_date, progress')
          .eq('user_id', userId).eq('project_id', proj.id).order('created_at', { ascending: false }).limit(30);
        if (error) throw error;
        return { ok: true, summary: `${data?.length ?? 0} task(s) in “${proj.name}”.`, data };
      }
      case 'create_project_task': {
        const proj = await resolveProject(supabase, userId, String(args.project_id_or_name || ''));
        if (!proj) return { ok: false, summary: 'Project not found.', error: 'not_found' };
        const insert = {
          user_id: userId,
          project_id: proj.id,
          title: String(args.title || 'Untitled task'),
          description: '',
          status: 'todo',
          priority: ['low','medium','high','urgent'].includes(args.priority) ? args.priority : 'medium',
          assigned_to: [],
          start_date: new Date().toISOString(),
          due_date: args.due ? new Date(args.due).toISOString() : new Date(Date.now() + 7 * 86400000).toISOString(),
          estimated_hours: 0, actual_hours: 0, progress: 0,
          tags: [], dependencies: [], attachments: [],
        };
        const { data, error } = await supabase.from('project_tasks').insert(insert).select().single();
        if (error) throw error;
        return { ok: true, summary: `Added “${insert.title}” to ${proj.name}.`, data };
      }
      case 'update_project_status': {
        const proj = await resolveProject(supabase, userId, String(args.project_id_or_name || ''));
        if (!proj) return { ok: false, summary: 'Project not found.', error: 'not_found' };
        const status = ['not-started','in-progress','on-hold','completed','cancelled'].includes(args.status) ? args.status : 'in-progress';
        const { data, error } = await supabase.from('projects')
          .update({ status }).eq('id', proj.id).eq('user_id', userId).select().single();
        if (error) throw error;
        return { ok: true, summary: `Set “${proj.name}” to ${status}.`, data };
      }

      // ─── Analytics ───
      case 'analytics_summary': {
        const today = new Date().toISOString();
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
        const [leads, newLeads, openTickets, openTasks, projects, paidInvoices, overdueInvoices] = await Promise.all([
          supabase.from('customers').select('id', { count: 'exact', head: true }).eq('user_id', userId),
          supabase.from('customers').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', weekAgo),
          supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('user_id', userId).in('status', ['open','in_progress']),
          supabase.from('project_tasks').select('id', { count: 'exact', head: true }).eq('user_id', userId).in('status', ['todo','in-progress','review']),
          supabase.from('projects').select('id', { count: 'exact', head: true }).eq('user_id', userId).in('status', ['not-started','in-progress']),
          supabase.from('quotes_invoices').select('total').eq('user_id', userId).eq('type', 'invoice').eq('status', 'paid'),
          supabase.from('quotes_invoices').select('id, total', { count: 'exact' }).eq('user_id', userId).eq('type', 'invoice').in('status', ['sent','overdue','partial']).lt('due_date', today),
        ]);
        const revenue = (paidInvoices.data ?? []).reduce((s: number, r: any) => s + Number(r.total || 0), 0);
        const overdueAmount = (overdueInvoices.data ?? []).reduce((s: number, r: any) => s + Number(r.total || 0), 0);
        const data = {
          total_leads: leads.count ?? 0,
          new_leads_week: newLeads.count ?? 0,
          open_tickets: openTickets.count ?? 0,
          open_tasks: openTasks.count ?? 0,
          active_projects: projects.count ?? 0,
          revenue_paid: revenue,
          overdue_count: overdueInvoices.count ?? 0,
          overdue_amount: overdueAmount,
        };
        return {
          ok: true,
          summary: `Snapshot: ${data.total_leads} leads (${data.new_leads_week} new this week), ${data.active_projects} active projects, ${data.open_tickets} open tickets, ${data.open_tasks} open tasks. Revenue: R${revenue.toFixed(2)}. Overdue: ${data.overdue_count} invoice(s) totalling R${overdueAmount.toFixed(2)}.`,
          data,
        };
      }

      // ─── Memory ───
      case 'remember': {
        const content = String(args.content || '').trim();
        if (!content) return { ok: false, summary: 'Nothing to remember.', error: 'empty' };
        const kind = ['preference', 'fact', 'style'].includes(args.kind) ? args.kind : 'fact';
        const { data, error } = await supabase.from('agent_memory').insert({
          user_id: userId, kind, content, source: 'chat', confidence: 0.9,
        }).select('id').single();
        if (error) throw error;
        return { ok: true, summary: `Got it — I'll remember that.`, data };
      }
      case 'forget': {
        const id = String(args.id || '').trim();
        if (!id) return { ok: false, summary: 'Need a memory id to forget.', error: 'missing_id' };
        const { error } = await supabase.from('agent_memory').delete().eq('id', id).eq('user_id', userId);
        if (error) throw error;
        return { ok: true, summary: 'Forgotten.' };
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
  if (tool === 'send_invoice_reminder' || tool === 'send_payment_reminder') {
    return { title: 'Send payment reminder', lines: [`Invoice: ${args.invoice_id_or_number}`] };
  }
  if (tool === 'schedule_meeting') {
    return {
      title: 'Schedule meeting',
      lines: [
        `Contact: ${args.contact ?? '—'}`,
        `Date: ${args.date ?? 'unspecified'}`,
        ...(args.notes ? [`Notes: ${args.notes}`] : []),
      ],
    };
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

    const access = await checkAgentAccess(supabase, user.id);
    if (!access.ok) {
      return new Response(JSON.stringify({ error: access.reason || 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const type = body?.type as string;
    const freeOnly = await isFreeOnly(supabase, user.id);

    // Confirm a previously-previewed action
    if (type === 'confirm') {
      const { tool, args } = body.action || {};
      if (!tool) return new Response(JSON.stringify({ error: 'Missing action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      const result = await execTool(supabase, user.id, tool, args || {});
      return new Response(JSON.stringify({ reply: result.summary, actionTaken: tool, actionResult: result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Phase 7: multi-step plan proposal. Returns { plan: { title, steps: [{tool,args,summary}] } }.
    if (type === 'plan') {
      const message: string = String(body.message ?? '').trim();
      const history: ChatMessage[] = Array.isArray(body.history) ? body.history.slice(-50) : [];
      if (!message) {
        return new Response(JSON.stringify({ error: 'Missing message' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const PLAN_PROMPT = `You are Quikle AI in PLAN MODE. The user has asked you to perform several CRM actions in one go. Break the request into 1–8 atomic tool calls and return ONLY a fenced JSON block tagged "plan":

\`\`\`plan
{
  "title": "<short human title>",
  "steps": [
    { "tool": "<tool_name>", "args": { }, "summary": "<one-line plain English>" }
  ]
}
\`\`\`

Allowed tools (use ONLY these — anything else will fail):
create_task, create_followup, schedule_meeting, create_workflow, toggle_workflow, create_project, create_project_task, update_project_status, remember.

Rules:
- At most 8 steps. Sequential order matters.
- Never invent tool names outside the allowed list above.
- Never include destructive bulk operations.
- Each step must have a clear summary the user will read before approving.
- Do NOT include any text outside the fenced block.`;

      const messages: ChatMessage[] = [
        { role: 'system', content: PLAN_PROMPT },
        ...history,
        { role: 'user', content: message },
      ];
      const raw = await callLLM(messages, freeOnly);
      const m = raw.match(/```plan\s*([\s\S]*?)```/i) || raw.match(/```json\s*([\s\S]*?)```/i) || raw.match(/\{[\s\S]*\}/);
      const jsonText = m ? (m[1] ?? m[0]) : raw;
      let plan: any = null;
      try { plan = JSON.parse(jsonText.trim()); } catch { /* ignore */ }
      if (!plan || !Array.isArray(plan.steps) || plan.steps.length === 0) {
        return new Response(JSON.stringify({ error: 'Could not produce a plan from that request.', raw }), {
          status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const steps = (plan.steps as any[]).slice(0, 8).map((s, i) => ({
        index: i,
        tool: String(s.tool || ''),
        args: (s.args && typeof s.args === 'object') ? s.args : {},
        summary: String(s.summary || s.tool || `Step ${i + 1}`),
      })).filter(s => s.tool);
      if (steps.length === 0) {
        return new Response(JSON.stringify({ error: 'Plan contained no valid steps.' }), {
          status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({
        plan: { title: String(plan.title || 'Plan'), steps },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Phase 5: feedback ingestion (👍 / 👎)
    if (type === 'feedback') {
      const messageId = String(body.messageId || '').trim();
      const rating = body.rating === 1 || body.rating === -1 ? body.rating : null;
      if (!messageId || rating === null) {
        return new Response(JSON.stringify({ error: 'Invalid feedback' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const { error } = await supabase.from('agent_feedback').insert({
        user_id: user.id, message_id: messageId, rating, comment: body.comment ?? null,
      });
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (type === 'chat') {
      const message: string = body.message ?? '';
      // Phase 1: client trims to a token budget and sends full conversation history.
      // Hard cap of 200 turns as a final safety net against pathological payloads.
      const history: ChatMessage[] = Array.isArray(body.history) ? body.history.slice(-200) : [];

      // Phase 5: inject up to 20 personalisation memories into the system prompt.
      let memoryBlock = '';
      try {
        const { data: mems } = await supabase
          .from('agent_memory')
          .select('content, kind')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(20);
        if (mems && mems.length) {
          memoryBlock = '\n\nUSER MEMORY (apply these unless overridden):\n' +
            mems.map((m: any) => `- [${m.kind}] ${m.content}`).join('\n');
        }
      } catch { /* memory optional */ }

      const messages: ChatMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT + memoryBlock },
        ...history,
        { role: 'user', content: message },
      ];
      const first = await callLLM(messages, freeOnly);
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
        ], freeOnly);
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
      ], freeOnly);
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
      ], freeOnly);
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
