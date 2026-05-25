// Quikle agent — proactive scanner.
// Scans the caller's CRM data and writes `agent_alerts` rows for outstanding
// items (overdue invoices, stale leads, SLA breaches, follow-ups due, etc.).
// Uses a `dedupe_key` so the same finding is not re-raised while still open.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

type SBClient = ReturnType<typeof createClient>;
type AlertInput = {
  alert_type: string;
  severity: 'info' | 'low' | 'medium' | 'high';
  title: string;
  message: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
  suggested_action?: { tool: string; args: Record<string, unknown> };
  dedupe_key: string;
};

const DAY = 86_400_000;
const iso = (d: Date) => d.toISOString();

async function upsertAlert(supabase: SBClient, userId: string, a: AlertInput) {
  // The partial unique index (user_id, dedupe_key) where status='open' makes this idempotent
  // for open alerts. If a duplicate exists, we silently skip.
  const { error } = await supabase
    .from('agent_alerts')
    .insert({
      user_id: userId,
      alert_type: a.alert_type,
      severity: a.severity,
      title: a.title,
      message: a.message,
      entity_type: a.entity_type ?? null,
      entity_id: a.entity_id ?? null,
      metadata: a.metadata ?? {},
      suggested_action: a.suggested_action ?? null,
      dedupe_key: a.dedupe_key,
    });
  if (error && !/duplicate key|unique constraint/i.test(error.message)) {
    console.warn('[scanner] insert failed:', error.message);
  }
}

async function scanForUser(supabase: SBClient, userId: string) {
  const now = new Date();
  const today = iso(now);
  const writes: Promise<unknown>[] = [];

  // ─── 1. Overdue invoices ──────────────────────────────────────────────
  const { data: overdue } = await supabase
    .from('quotes_invoices')
    .select('id, number, customer_name, customer_email, total, due_date')
    .eq('user_id', userId)
    .eq('type', 'invoice')
    .in('status', ['sent', 'overdue', 'partial'])
    .lt('due_date', today)
    .limit(50);

  for (const inv of overdue ?? []) {
    const daysLate = Math.max(1, Math.floor((now.getTime() - new Date((inv as any).due_date).getTime()) / DAY));
    const sev: AlertInput['severity'] = daysLate > 30 ? 'high' : daysLate > 14 ? 'medium' : 'low';
    writes.push(upsertAlert(supabase, userId, {
      alert_type: 'invoice_overdue',
      severity: sev,
      title: `Invoice ${(inv as any).number} is ${daysLate}d overdue`,
      message: `${(inv as any).customer_name ?? 'Customer'} owes R${Number((inv as any).total || 0).toFixed(2)} — due ${(inv as any).due_date?.slice(0, 10)}.`,
      entity_type: 'invoice',
      entity_id: (inv as any).id,
      metadata: { number: (inv as any).number, total: (inv as any).total, days_late: daysLate },
      suggested_action: {
        tool: 'send_payment_reminder',
        args: { invoice_id_or_number: (inv as any).number },
      },
      dedupe_key: `invoice_overdue:${(inv as any).id}`,
    }));
  }

  // ─── 2. Stale leads (no update in 14 days, still "new" or "contacted") ─
  const fourteenDaysAgo = iso(new Date(now.getTime() - 14 * DAY));
  const { data: stale } = await supabase
    .from('customers')
    .select('id, name, status, updated_at')
    .eq('user_id', userId)
    .in('status', ['new', 'contacted', 'qualified'])
    .lt('updated_at', fourteenDaysAgo)
    .limit(50);

  for (const lead of stale ?? []) {
    writes.push(upsertAlert(supabase, userId, {
      alert_type: 'lead_stale',
      severity: 'medium',
      title: `Lead ${(lead as any).name} has gone cold`,
      message: `No update on ${(lead as any).name} since ${(lead as any).updated_at?.slice(0, 10)}. Reach out or move stage.`,
      entity_type: 'customer',
      entity_id: (lead as any).id,
      metadata: { status: (lead as any).status },
      suggested_action: {
        tool: 'create_followup',
        args: { contact: (lead as any).name, method: 'call', notes: 'Re-engage stale lead' },
      },
      dedupe_key: `lead_stale:${(lead as any).id}`,
    }));
  }

  // ─── 3. SLA breaches — high-priority tickets open > 24h ──────────────
  const yesterday = iso(new Date(now.getTime() - DAY));
  const { data: slaTickets } = await supabase
    .from('tickets')
    .select('id, subject, priority, created_at, status')
    .eq('user_id', userId)
    .in('status', ['open', 'in_progress'])
    .in('priority', ['high', 'urgent'])
    .lt('created_at', yesterday)
    .limit(50);

  for (const t of slaTickets ?? []) {
    writes.push(upsertAlert(supabase, userId, {
      alert_type: 'ticket_sla_breach',
      severity: 'high',
      title: `SLA risk: ${(t as any).subject ?? 'Untitled ticket'}`,
      message: `High-priority ticket open since ${(t as any).created_at?.slice(0, 10)} — still ${(t as any).status}.`,
      entity_type: 'ticket',
      entity_id: (t as any).id,
      metadata: { priority: (t as any).priority },
      suggested_action: {
        tool: 'move_ticket',
        args: { ticket_id_or_subject: (t as any).subject, status: 'in_progress' },
      },
      dedupe_key: `ticket_sla_breach:${(t as any).id}`,
    }));
  }

  // ─── 4. Follow-ups due today or earlier, still pending ──────────────
  const endOfToday = iso(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59));
  const { data: dueFollowups } = await supabase
    .from('followups')
    .select('id, contact, date, method')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .lte('date', endOfToday.slice(0, 10))
    .limit(50);

  for (const f of dueFollowups ?? []) {
    writes.push(upsertAlert(supabase, userId, {
      alert_type: 'followup_due',
      severity: 'low',
      title: `Follow-up due: ${(f as any).contact}`,
      message: `${(f as any).method ?? 'Follow-up'} with ${(f as any).contact} scheduled for ${(f as any).date}.`,
      entity_type: 'followup',
      entity_id: (f as any).id,
      metadata: { method: (f as any).method },
      dedupe_key: `followup_due:${(f as any).id}:${(f as any).date}`,
    }));
  }

  await Promise.allSettled(writes);

  const { count } = await supabase
    .from('agent_alerts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'open');

  return { scanned_at: today, open_count: count ?? 0 };
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

    const result = await scanForUser(supabase, user.id);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[scanner] error:', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
