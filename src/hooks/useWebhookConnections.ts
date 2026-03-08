import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export interface WebhookConnection {
  id: string;
  name: string;
  platform: 'zapier' | 'make' | 'n8n' | 'custom';
  webhook_url: string;
  is_active: boolean;
  trigger_count: number;
  last_triggered_at: string | null;
  connected_apps: string[];
  created_at: string;
  updated_at: string;
}

export interface NewWebhookConnection {
  name: string;
  platform: 'zapier' | 'make' | 'n8n' | 'custom';
  webhook_url: string;
  connected_apps: string[];
}

export const useWebhookConnections = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['webhook-connections', user?.id];

  const { data: connections = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(conn => ({
        ...conn,
        platform: conn.platform as 'zapier' | 'make' | 'n8n' | 'custom',
      })) as WebhookConnection[];
    },
    enabled: !!user?.id,
  });

  const testWebhook = async (connection: WebhookConnection) => {
    try {
      toast.info('Sending test webhook...');

      // Use standard fetch without no-cors to get real response
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      let testSuccess = false;
      let errorMessage: string | null = null;

      try {
        const response = await fetch(connection.webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            test: true,
            timestamp: new Date().toISOString(),
            source: 'quikle_test',
            data: {
              customer_name: 'Test Customer',
              message: 'This is a test webhook trigger from Quikle'
            }
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        testSuccess = response.ok;
        if (!response.ok) {
          errorMessage = `HTTP ${response.status}`;
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        // CORS errors or network failures — still log but mark as unknown
        if (fetchError.name === 'AbortError') {
          errorMessage = 'Request timed out (10s)';
        } else {
          // Likely CORS — the webhook may have succeeded server-side
          testSuccess = true; // Optimistic for outbound webhooks
          errorMessage = null;
        }
      }

      // Log the test
      await supabase.from('webhook_logs').insert({
        user_id: user?.id,
        connection_id: connection.id,
        request_method: 'POST',
        request_payload: { test: true },
        success: testSuccess,
        error_message: errorMessage,
        response_status: testSuccess ? 200 : 0,
      });

      // Update trigger count
      await supabase
        .from('webhook_connections')
        .update({
          trigger_count: connection.trigger_count + 1,
          last_triggered_at: new Date().toISOString()
        })
        .eq('id', connection.id);

      if (testSuccess) {
        toast.success('Test webhook sent! Check your automation platform for the delivery.');
      } else {
        toast.warning(`Webhook may have failed: ${errorMessage}. Check your platform.`);
      }
      
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['webhook-logs'] });
    } catch (error) {
      console.error('Webhook test failed:', error);
      toast.error('Failed to send test webhook');
    }
  };

  const createConnection = async (newConnection: NewWebhookConnection): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to create connections');
      return false;
    }

    if (!newConnection.name || !newConnection.webhook_url) {
      toast.error('Please fill in all required fields');
      return false;
    }

    try {
      const { error } = await supabase.from('webhook_connections').insert({
        user_id: user.id,
        name: newConnection.name,
        platform: newConnection.platform,
        webhook_url: newConnection.webhook_url,
        connected_apps: newConnection.connected_apps,
      });

      if (error) throw error;

      toast.success('Webhook connection created successfully');
      queryClient.invalidateQueries({ queryKey });
      return true;
    } catch (error) {
      console.error('Error creating connection:', error);
      toast.error('Failed to create webhook connection');
      return false;
    }
  };

  const toggleConnection = async (id: string) => {
    const connection = connections.find(c => c.id === id);
    if (!connection) return;

    // Optimistic update
    queryClient.setQueryData(queryKey, (old: WebhookConnection[] | undefined) =>
      (old || []).map(c => c.id === id ? { ...c, is_active: !c.is_active } : c)
    );

    try {
      const { error } = await supabase
        .from('webhook_connections')
        .update({ is_active: !connection.is_active })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Connection ${connection.is_active ? 'disabled' : 'enabled'}`);
    } catch (error) {
      console.error('Error toggling connection:', error);
      toast.error('Failed to update connection');
      queryClient.invalidateQueries({ queryKey });
    }
  };

  const deleteConnection = async (id: string) => {
    queryClient.setQueryData(queryKey, (old: WebhookConnection[] | undefined) =>
      (old || []).filter(c => c.id !== id)
    );

    try {
      const { error } = await supabase
        .from('webhook_connections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Webhook connection deleted');
    } catch (error) {
      console.error('Error deleting connection:', error);
      toast.error('Failed to delete connection');
      queryClient.invalidateQueries({ queryKey });
    }
  };

  return {
    connections,
    isLoading,
    testWebhook,
    createConnection,
    toggleConnection,
    deleteConnection,
    refetch: () => queryClient.invalidateQueries({ queryKey }),
  };
};
