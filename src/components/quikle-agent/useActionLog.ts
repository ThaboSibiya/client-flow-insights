import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ActionLogEntry } from './types';

export function useActionLog() {
  const [entries, setEntries] = useState<ActionLogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('agent_action_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      setEntries((data ?? []) as ActionLogEntry[]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return { entries, loading, reload: load };
}
