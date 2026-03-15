import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, schedule_id } = await req.json();

    if (action === 'list') {
      // List all active sync schedules
      const { data, error } = await supabase
        .from('data_sync_rules')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ schedules: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'trigger' && schedule_id) {
      // Manually trigger a sync
      const { data: rule, error: ruleError } = await supabase
        .from('data_sync_rules')
        .select('*')
        .eq('id', schedule_id)
        .single();

      if (ruleError || !rule) {
        return new Response(JSON.stringify({ error: 'Schedule not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update last_sync_at and increment sync_count
      await supabase
        .from('data_sync_rules')
        .update({
          last_sync_at: new Date().toISOString(),
          sync_count: (rule.sync_count || 0) + 1,
          status: 'syncing',
        })
        .eq('id', schedule_id);

      // Simulate sync process — in production this would call the CRM API
      // using stored OAuth tokens from the data_sync_rules config
      const config = rule.config as Record<string, unknown> || {};
      const sourceSystem = rule.source_system;

      console.log(`Triggering sync for rule ${rule.name}: ${sourceSystem} → ${rule.target_system}`);
      console.log(`Config:`, JSON.stringify(config));

      // Mark as completed
      await supabase
        .from('data_sync_rules')
        .update({ status: 'active' })
        .eq('id', schedule_id);

      return new Response(JSON.stringify({
        success: true,
        message: `Sync triggered for "${rule.name}"`,
        source: sourceSystem,
        data_type: rule.data_type,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'check_due') {
      // Check which schedules are due to run (called by cron)
      const { data: rules, error } = await supabase
        .from('data_sync_rules')
        .select('*')
        .eq('is_active', true)
        .in('status', ['active', 'idle']);

      if (error) throw error;

      const now = new Date();
      const triggered: string[] = [];

      for (const rule of rules || []) {
        const lastSync = rule.last_sync_at ? new Date(rule.last_sync_at) : new Date(0);
        const diffHours = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);

        let isDue = false;
        switch (rule.frequency) {
          case 'hourly': isDue = diffHours >= 1; break;
          case 'daily': isDue = diffHours >= 24; break;
          case 'weekly': isDue = diffHours >= 168; break;
          case 'monthly': isDue = diffHours >= 720; break;
        }

        if (isDue) {
          console.log(`Schedule "${rule.name}" is due for sync`);
          triggered.push(rule.id);

          // Update status
          await supabase
            .from('data_sync_rules')
            .update({
              last_sync_at: now.toISOString(),
              sync_count: (rule.sync_count || 0) + 1,
              status: 'active',
            })
            .eq('id', rule.id);
        }
      }

      return new Response(JSON.stringify({
        checked: (rules || []).length,
        triggered: triggered.length,
        triggered_ids: triggered,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Import scheduler error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
