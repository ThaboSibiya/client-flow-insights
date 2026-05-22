import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface WebhookLog {
  id: string;
  trigger_id: string | null;
  connection_id: string | null;
  request_method: string | null;
  request_payload: Record<string, any> | null;
  response_status: number | null;
  response_body: string | null;
  success: boolean | null;
  error_message: string | null;
  created_at: string | null;
}

export const useWebhookLogs = (limit = 50) => {
  const { user } = useAuth();

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['webhook-logs', user?.id, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('id, user_id, connection_id, trigger_id, request_method, request_payload, response_status, response_body, success, error_message, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(log => ({
        ...log,
        request_payload: log.request_payload as Record<string, any> | null,
      })) as WebhookLog[];
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Auto-refresh every 30s
  });

  return { logs, isLoading, refetch };
};
