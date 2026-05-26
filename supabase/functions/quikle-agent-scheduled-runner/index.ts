// Quikle agent — scheduled prompts runner.
// Cron-invoked. Finds active scheduled prompts whose next_run_at <= now,
// executes each via Lovable AI Gateway, stores the result summary, posts a
// user notification, and advances next_run_at to the next occurrence.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;

type ScheduledPrompt = {
  id: string;
  user_id: string;
  workspace_id: string;
  name: string;
  prompt: string;
  frequency: 'daily' | 'weekdays' | 'weekly' | 'monthly';
  time_of_day: string; // HH:MM:SS
  day_of_week: number | null;
  day_of_month: number | null;
  timezone: string;
  next_run_at: string;
};

/** Compute the next run timestamp (UTC ISO) given frequency rules. */
function computeNextRunAt(p: ScheduledPrompt, from: Date = new Date()): string {
  const [hh, mm] = p.time_of_day.split(':').map(Number);
  // Naive UTC scheduling. Timezone is informational; for production this would
  // resolve via a tz library. Keeping deps minimal here.
  const candidate = new Date(from);
  candidate.setUTCHours(hh, mm, 0, 0);

  const advanceDays = (n: number) => candidate.setUTCDate(candidate.getUTCDate() + n);

  if (p.frequency === 'daily') {
    if (candidate <= from) advanceDays(1);
  } else if (p.frequency === 'weekdays') {
    if (candidate <= from) advanceDays(1);
    while (candidate.getUTCDay() === 0 || candidate.getUTCDay() === 6) advanceDays(1);
  } else if (p.frequency === 'weekly') {
    const target = p.day_of_week ?? 1;
    const delta = (target - candidate.getUTCDay() + 7) % 7;
    if (delta > 0) advanceDays(delta);
    if (candidate <= from) advanceDays(7);
  } else if (p.frequency === 'monthly') {
    const target = p.day_of_month ?? 1;
    candidate.setUTCDate(target);
    if (candidate <= from) {
      candidate.setUTCMonth(candidate.getUTCMonth() + 1);
      candidate.setUTCDate(target);
    }
  }
  return candidate.toISOString();
}

async function gatherWorkspaceContext(supabase: ReturnType<typeof createClient>, userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

  const [followups, overdue, pipeline] = await Promise.allSettled([
    supabase.from('followups').select('contact, method, date, status')
      .eq('user_id', userId).eq('status', 'pending').lte('date', today).limit(15),
    supabase.from('quotes_invoices').select('number, customer_name, total, due_date')
      .eq('user_id', userId).eq('type', 'invoice')
      .in('status', ['sent', 'overdue', 'partial']).lt('due_date', tomorrow).limit(15),
    supabase.from('customers').select('name, status, created_at')
      .eq('user_id', userId).order('created_at', { ascending: false }).limit(15),
  ]);

  return {
    followups: followups.status === 'fulfilled' ? followups.value.data ?? [] : [],
    overdue: overdue.status === 'fulfilled' ? overdue.value.data ?? [] : [],
    customers: pipeline.status === 'fulfilled' ? pipeline.value.data ?? [] : [],
  };
}

async function runPrompt(p: ScheduledPrompt, supabase: ReturnType<typeof createClient>): Promise<string> {
  const ctx = await gatherWorkspaceContext(supabase, p.user_id);

  const system = `You are Quikle, a friendly CRM assistant running a user's scheduled prompt.
Respond in markdown. Under 200 words. Use ZAR (R) for money. Be concrete and action-oriented.
You have read-only context below — use only what's relevant to the user's prompt.`;

  const user = `User's scheduled prompt: "${p.prompt}"

CRM snapshot:
- Follow-ups due today: ${JSON.stringify(ctx.followups.slice(0, 8))}
- Overdue/open invoices: ${JSON.stringify(ctx.overdue.slice(0, 8))}
- Recent customers: ${JSON.stringify(ctx.customers.slice(0, 8))}`;

  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LOVABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`AI gateway ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const summary = data?.choices?.[0]?.message?.content?.trim();
  if (!summary) throw new Error('Empty model response');
  return summary;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    const nowIso = new Date().toISOString();
    const { data: due, error } = await supabase
      .from('agent_scheduled_prompts')
      .select('id, user_id, workspace_id, name, prompt, frequency, time_of_day, day_of_week, day_of_month, timezone, next_run_at')
      .eq('is_active', true)
      .lte('next_run_at', nowIso)
      .limit(50);
    if (error) throw error;

    const prompts = (due ?? []) as ScheduledPrompt[];
    const results: { id: string; ok: boolean; error?: string }[] = [];

    for (const p of prompts) {
      try {
        const summary = await runPrompt(p, supabase);
        const nextRunAt = computeNextRunAt(p);

        await supabase.from('agent_scheduled_prompts').update({
          last_run_at: nowIso,
          next_run_at: nextRunAt,
          last_result_summary: summary,
        }).eq('id', p.id);

        await supabase.from('user_notifications').insert({
          user_id: p.user_id,
          type: 'agent_scheduled',
          title: `Quikle: ${p.name}`,
          message: summary.length > 280 ? summary.slice(0, 277) + '…' : summary,
          link: '/',
          metadata: { scheduled_prompt_id: p.id, full_summary: summary },
        });

        results.push({ id: p.id, ok: true });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[scheduled-runner] ${p.id} failed:`, msg);
        // Push next_run_at forward anyway so we don't loop on a broken prompt.
        const nextRunAt = computeNextRunAt(p);
        await supabase.from('agent_scheduled_prompts').update({
          last_run_at: nowIso,
          next_run_at: nextRunAt,
          last_result_summary: `⚠️ Failed: ${msg.slice(0, 200)}`,
        }).eq('id', p.id);
        results.push({ id: p.id, ok: false, error: msg });
      }
    }

    return new Response(JSON.stringify({ ran: results.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[scheduled-runner] fatal:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
