import { useState, useEffect } from 'react';
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
  const [connections, setConnections] = useState<WebhookConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchConnections = async () => {
    if (!user) {
      setConnections([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('webhook_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setConnections((data || []).map(conn => ({
        ...conn,
        platform: conn.platform as 'zapier' | 'make' | 'n8n' | 'custom',
      })));
    } catch (error) {
      console.error('Error fetching webhook connections:', error);
      toast.error('Failed to load webhook connections');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [user]);

  const testWebhook = async (connection: WebhookConnection) => {
    try {
      toast.info('Sending test webhook...');
      
      const response = await fetch(connection.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          source: 'quikle_test',
          data: {
            customer_name: 'Test Customer',
            message: 'This is a test webhook trigger from Quikle'
          }
        })
      });

      // Log the test
      await supabase.from('webhook_logs').insert({
        user_id: user?.id,
        connection_id: connection.id,
        request_method: 'POST',
        request_payload: { test: true },
        success: true,
      });

      // Update trigger count
      await supabase
        .from('webhook_connections')
        .update({ 
          trigger_count: connection.trigger_count + 1,
          last_triggered_at: new Date().toISOString()
        })
        .eq('id', connection.id);

      toast.success('Test webhook sent! Check your automation platform for the delivery.');
      fetchConnections();
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
      fetchConnections();
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

    try {
      const { error } = await supabase
        .from('webhook_connections')
        .update({ is_active: !connection.is_active })
        .eq('id', id);

      if (error) throw error;

      setConnections(connections.map(conn =>
        conn.id === id ? { ...conn, is_active: !conn.is_active } : conn
      ));

      toast.success(`Connection ${connection.is_active ? 'disabled' : 'enabled'}`);
    } catch (error) {
      console.error('Error toggling connection:', error);
      toast.error('Failed to update connection');
    }
  };

  const deleteConnection = async (id: string) => {
    try {
      const { error } = await supabase
        .from('webhook_connections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setConnections(connections.filter(conn => conn.id !== id));
      toast.success('Webhook connection deleted');
    } catch (error) {
      console.error('Error deleting connection:', error);
      toast.error('Failed to delete connection');
    }
  };

  return {
    connections,
    isLoading,
    testWebhook,
    createConnection,
    toggleConnection,
    deleteConnection,
    refetch: fetchConnections
  };
};
