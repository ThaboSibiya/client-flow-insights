import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const MODEL = 'minimax/minimax-m2.5:free';

const SYSTEM_PROMPT = `You are Quikle AI, a CRM agent for Quikle Innovation Suite. When the user asks you to do something in the CRM, respond with ONLY a fenced code block tagged "action" containing JSON:

\`\`\`action
{ "tool": "create_task | create_followup | assign_lead | get_tasks | get_leads | get_followups", "args": { } }
\`\`\`

Tool args:
- create_task: { title, assignee?, due (YYYY-MM-DD)?, priority (low/medium/high)? }
- create_followup: { contact, date (YYYY-MM-DD)?, method (call/email/meeting)?, notes? }
- assign_lead: { lead_id, assignee }
- get_tasks: { status (open/done/all)? }
- get_leads: { status? }
- get_followups: { status (pending/done/all)? }

Execute without asking for confirmation. After a tool result is returned to you, reply with ONE short plain sentence confirming what you did. For greetings or general questions, reply normally in plain text.`;

interface ChatMessage { role: 'user' | 'assistant' | 'system'; content: string }

async function callOpenRouter(messages: ChatMessage[]): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://quikle-innovation-suite.lovable.app',
      'X-Title': 'Quikle AI Agent',
    },
    body: JSON.stringify({ model: MODEL, messages, temperature: 0.4 }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${t}`);
  }
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? '';
}

function parseAction(text: string): { tool: string; args: Record<string, unknown> } | null {
  const m = text.match(/```action\s*([\s\S]*?)```/i) || text.match(/```json\s*([\s\S]*?)```/i);
  const raw = m ? m[1] : null;
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw.trim());
    if (obj && typeof obj.tool === 'string') return { tool: obj.tool, args: obj.args || {} };
  } catch { /* try to find first JSON object */ }
  const j = raw.match(/\{[\s\S]*\}/);
  if (j) {
    try { const obj = JSON.parse(j[0]); if (obj?.tool) return { tool: obj.tool, args: obj.args || {} }; } catch { /* ignore */ }
  }
  return null;
}

function nextTicketNumber(): string {
  return `TKT-${Date.now().toString(36).toUpperCase()}`;
}

async function execTool(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  tool: string,
  args: Record<string, any>,
): Promise<{ ok: boolean; summary: string; data?: unknown; error?: string }> {
  try {
    if (tool === 'create_task') {
      // Map to existing tickets table. Need a customer; pick the most recent if none provided.
      const { data: customer } = await supabase
        .from('customers').select('id, name').eq('user_id', userId)
        .order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (!customer) return { ok: false, summary: 'No customer exists yet to attach task to.', error: 'no_customer' };
      const insert = {
        user_id: userId,
        customer_id: customer.id,
        subject: String(args.title || 'Untitled task'),
        ticket_number: nextTicketNumber(),
        priority: ['low','medium','high'].includes(args.priority) ? args.priority : 'medium',
        status: 'open',
        assigned_to_name: args.assignee ?? null,
        description: args.due ? `Due: ${args.due}` : null,
      };
      const { data, error } = await supabase.from('tickets').insert(insert).select().single();
      if (error) throw error;
      return { ok: true, summary: `Created task “${insert.subject}”${args.assignee ? ` for ${args.assignee}` : ''}.`, data };
    }

    if (tool === 'create_followup') {
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

    if (tool === 'assign_lead') {
      const { data, error } = await supabase
        .from('customers')
        .update({ contact_person: args.assignee })
        .eq('id', args.lead_id).eq('user_id', userId).select().single();
      if (error) throw error;
      return { ok: true, summary: `Assigned lead to ${args.assignee}.`, data };
    }

    if (tool === 'get_tasks') {
      let q = supabase.from('tickets').select('id, subject, status, priority, assigned_to_name, created_at')
        .eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
      if (args.status && args.status !== 'all') {
        q = args.status === 'done' ? q.in('status', ['resolved','closed']) : q.eq('status', args.status);
      }
      const { data, error } = await q;
      if (error) throw error;
      return { ok: true, summary: `Found ${data?.length ?? 0} task(s).`, data };
    }

    if (tool === 'get_leads') {
      let q = supabase.from('customers').select('id, name, email, status, contact_person, created_at')
        .eq('user_id', userId).order('created_at', { ascending: false }).limit(20);
      if (args.status) q = q.eq('status', args.status);
      const { data, error } = await q;
      if (error) throw error;
      return { ok: true, summary: `Found ${data?.length ?? 0} lead(s).`, data };
    }

    if (tool === 'get_followups') {
      let q = supabase.from('followups').select('*').eq('user_id', userId)
        .order('date', { ascending: true }).limit(20);
      if (args.status && args.status !== 'all') q = q.eq('status', args.status);
      const { data, error } = await q;
      if (error) throw error;
      return { ok: true, summary: `Found ${data?.length ?? 0} follow-up(s).`, data };
    }

    return { ok: false, summary: `Unknown tool: ${tool}`, error: 'unknown_tool' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, summary: `Action failed: ${msg}`, error: msg };
  }
}

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

    if (type === 'chat') {
      const message: string = body.message ?? '';
      const history: ChatMessage[] = Array.isArray(body.history) ? body.history.slice(-10) : [];
      const messages: ChatMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: message },
      ];
      const first = await callOpenRouter(messages);
      const action = parseAction(first);

      if (!action) {
        return new Response(JSON.stringify({ reply: first }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const result = await execTool(supabase, user.id, action.tool, action.args);
      const followup = await callOpenRouter([
        ...messages,
        { role: 'assistant', content: first },
        { role: 'user', content: `Tool result: ${JSON.stringify(result)}. Reply with ONE short plain sentence confirming the outcome (no JSON, no code).` },
      ]);

      return new Response(JSON.stringify({
        reply: followup || result.summary,
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
      const raw = await callOpenRouter([
        { role: 'system', content: 'You extract structured notes from meeting transcripts. Return ONLY a JSON object, no code fences, no commentary.' },
        { role: 'user', content: `Transcript:\n${transcript}\n\nReturn:\n{ "summary": "...", "decisions": ["..."], "action_items": ["..."], "follow_up_date": "YYYY-MM-DD or null" }` },
      ]);
      let parsed: any = {};
      try { parsed = JSON.parse(raw); } catch {
        const m = raw.match(/\{[\s\S]*\}/); if (m) try { parsed = JSON.parse(m[0]); } catch {}
      }
      const insert = {
        user_id: user.id,
        title,
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
      const summary = await callOpenRouter([
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
