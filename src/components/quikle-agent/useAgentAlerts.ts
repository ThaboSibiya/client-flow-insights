import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AgentAlert = {
  id: string;
  alert_type: string;
  severity: 'info' | 'low' | 'medium' | 'high';
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  suggested_action: { tool: string; args: Record<string, unknown> } | null;
  status: 'open' | 'resolved' | 'dismissed';
  created_at: string;
};

/**
 * Subscribes to the user's open agent alerts and exposes resolve/dismiss/scan helpers.
 * Realtime updates keep the inbox in sync across tabs.
 */
export function useAgentAlerts() {
  const [alerts, setAlerts] = useState<AgentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const userIdRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    userIdRef.current = user.id;
    const { data } = await supabase
      .from('agent_alerts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(50);
    setAlerts((data ?? []) as AgentAlert[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('agent_alerts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_alerts' }, () => {
        void load();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const scan = useCallback(async () => {
    setScanning(true);
    try {
      await supabase.functions.invoke('quikle-agent-scanner', { body: {} });
      await load();
    } catch (e) {
      console.warn('[useAgentAlerts] scan failed:', e);
    } finally {
      setScanning(false);
    }
  }, [load]);

  const resolve = useCallback(async (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    await supabase
      .from('agent_alerts')
      .update({ status: 'resolved', resolved_at: new Date().toISOString() })
      .eq('id', id);
  }, []);

  const dismiss = useCallback(async (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    await supabase
      .from('agent_alerts')
      .update({ status: 'dismissed', resolved_at: new Date().toISOString() })
      .eq('id', id);
  }, []);

  return { alerts, loading, scanning, scan, resolve, dismiss, reload: load };
}
