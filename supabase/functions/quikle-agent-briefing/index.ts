// Quikle agent — daily login briefing.
// Returns today's cached briefing for the caller, or generates one if missing.
// Summarizes open agent_alerts + today's follow-ups + overdue invoices into a
// short markdown briefing with the top 3 priorities. Cached per user per day.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;

type SBClient = ReturnType<typeof createClient>;

const todayISO = () => new Date().toISOString().slice(0, 10);
const DAY = 86_400_000;

async function gatherContext(supabase: SBClient, userId: string) {
  const now = new Date();
  const today = todayISO();
  const tomorrow = new Date(now.getTime() + DAY).toISOString().slice(0, 10);

  const [alertsRes, followupsRes, overdueRes, freshLeadsRes] = await Promise.allSettled([
    supabase.from('agent_alerts')
      .select('alert_type, severity, title, message')
      .eq('user_id', userId).eq('status', 'open')
      .order('severity', { ascending: false })
      .limit(20),
    supabase.from('followups')
      .select('contact, method, date, status')
      .eq('user_id', userId).eq('status', 'pending')
      .lte('date', today)
      .limit(20),
    supabase.from('quotes_invoices')
      .select('number, customer_name, total, due_date')
      .eq('user_id', userId).eq('type', 'invoice')
      .in('status', ['sent', 'overdue', 'partial'])
      .lt('due_date', tomorrow)
      .limit(20),
    supabase.from('customers')
      .select('name, status, created_at')
      .eq('user_id', userId)
      .gte('created_at', new Date(now.getTime() - DAY).toISOString())
      .limit(20),
  ]);

  const alerts = alertsRes.status === 'fulfilled' ? (alertsRes.value.data ?? []) : [];
  const followups = followupsRes.status === 'fulfilled' ? (followupsRes.value.data ?? []) : [];
  const overdue = overdueRes.status === 'fulfilled' ? (overdueRes.value.data ?? []) : [];
  const newLeads = freshLeadsRes.status === 'fulfilled' ? (freshLeadsRes.value.data ?? []) : [];

  return {
    alerts, followups, overdue, newLeads,
    stats: {
      open_alerts: alerts.length,
      followups_due: followups.length,
      overdue_invoices: overdue.length,
      new_leads_24h: newLeads.length,
    },
  };
}

async function generateBriefing(ctx: Awaited<ReturnType<typeof gatherContext>>) {
  const system = `You are Quikle, a friendly CRM assistant. Write a SHORT morning briefing in markdown.
Rules:
- Open with a one-line warm greeting (no name).
- 2-4 short bullets covering what matters today (overdue invoices, follow-ups due, hot alerts, new leads).
- Then a "### Top 3 priorities" section with exactly 3 numbered, action-oriented items.
- Total length under 120 words. Use ZAR currency (R). No fluff.
- If everything is quiet, say so cheerfully and suggest one proactive action.`;

  const user = `Open alerts (${ctx.stats.open_alerts}): ${JSON.stringify(ctx.alerts.slice(0, 8))}
Follow-ups due (${ctx.stats.followups_due}): ${JSON.stringify(ctx.followups.slice(0, 8))}
Overdue invoices (${ctx.stats.overdue_invoices}): ${JSON.stringify(ctx.overdue.slice(0, 8))}
New leads in last 24h (${ctx.stats.new_leads_24h}): ${JSON.stringify(ctx.newLeads.slice(0, 5))}`;

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

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AI gateway error ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  const summary = data?.choices?.[0]?.message?.content?.trim() ?? '';
  if (!summary) throw new Error('Empty briefing from model');
  return summary;
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

    const today = todayISO();

    // Return cached briefing if already generated today.
    const { data: cached } = await supabase
      .from('agent_daily_briefings')
      .select('*')
      .eq('user_id', user.id)
      .eq('briefing_date', today)
      .maybeSingle();

    if (cached) {
      return new Response(JSON.stringify({
        summary: cached.summary,
        stats: cached.stats,
        posted: cached.posted_to_chat,
        cached: true,
        briefing_id: cached.id,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const ctx = await gatherContext(supabase, user.id);
    const summary = await generateBriefing(ctx);

    const { data: inserted } = await supabase
      .from('agent_daily_briefings')
      .insert({
        user_id: user.id,
        briefing_date: today,
        summary,
        stats: ctx.stats,
        priorities: [],
      })
      .select('id')
      .single();

    return new Response(JSON.stringify({
      summary,
      stats: ctx.stats,
      posted: false,
      cached: false,
      briefing_id: inserted?.id,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[briefing] error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
