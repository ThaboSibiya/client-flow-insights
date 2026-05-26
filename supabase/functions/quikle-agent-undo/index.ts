import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

// Inverse op format: { table: '<table>', id: '<row id>' } → soft/hard delete the row.
// Only supports user-scoped tables we can safely delete from in CRM context.
const UNDOABLE_TABLES = new Set([
  'tickets',           // create_task → ticket row
  'followups',         // create_followup
  'customers',         // create_lead
  'quotes_invoices',   // create_quote / create_invoice
  'workflow_automations', // create_workflow
  'projects',          // create_project
  'project_tasks',     // create_project_task
  'agent_memory',      // remember
]);

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

    const body = await req.json().catch(() => ({}));
    const planId = String(body?.plan_id || '').trim();
    if (!planId) {
      return new Response(JSON.stringify({ error: 'Missing plan_id' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Load completed rows for this plan, in REVERSE step order.
    const { data: rows, error } = await supabase
      .from('agent_action_log')
      .select('id, step_index, tool_name, inverse_op, status')
      .eq('plan_id', planId)
      .eq('user_id', user.id)
      .eq('status', 'done')
      .order('step_index', { ascending: false });
    if (error) throw error;

    const results: Array<{ id: string; ok: boolean; reason?: string }> = [];
    for (const row of rows ?? []) {
      const inv = (row as any).inverse_op as { table?: string; id?: string } | null;
      if (!inv || !inv.table || !inv.id) {
        results.push({ id: (row as any).id, ok: false, reason: 'no_inverse' });
        continue;
      }
      if (!UNDOABLE_TABLES.has(inv.table)) {
        results.push({ id: (row as any).id, ok: false, reason: 'table_not_undoable' });
        continue;
      }
      const { error: delErr } = await supabase
        .from(inv.table)
        .delete()
        .eq('id', inv.id)
        .eq('user_id', user.id);
      if (delErr) {
        results.push({ id: (row as any).id, ok: false, reason: delErr.message });
        continue;
      }
      await supabase
        .from('agent_action_log')
        .update({ status: 'undone', finished_at: new Date().toISOString() })
        .eq('id', (row as any).id);
      results.push({ id: (row as any).id, ok: true });
    }

    const undone = results.filter(r => r.ok).length;
    return new Response(JSON.stringify({
      ok: true,
      undone,
      total: results.length,
      results,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
