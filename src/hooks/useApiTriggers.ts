import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export interface ApiTrigger {
  id: string;
  name: string;
  endpoint_key: string;
  method: string;
  auth_type: string;
  description: string | null;
  sample_payload: Record<string, any> | null;
  is_active: boolean;
  trigger_count: number;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewApiTrigger {
  name: string;
  method: string;
  auth_type: string;
  description?: string;
  sample_payload?: Record<string, any>;
}

const SUPABASE_PROJECT_REF = 'oquiaxbnkdnpixqhqdfq';

export const useApiTriggers = () => {
  const [triggers, setTriggers] = useState<ApiTrigger[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const getWebhookUrl = (endpointKey: string) => {
    return `https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1/webhook-receiver/${endpointKey}`;
  };

  const fetchTriggers = async () => {
    if (!user) {
      setTriggers([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('api_triggers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTriggers((data || []).map(trigger => ({
        ...trigger,
        sample_payload: trigger.sample_payload as Record<string, any> | null,
      })));
    } catch (error) {
      console.error('Error fetching API triggers:', error);
      toast.error('Failed to load API triggers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTriggers();
  }, [user]);

  const createTrigger = async (newTrigger: NewApiTrigger): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to create triggers');
      return false;
    }

    if (!newTrigger.name) {
      toast.error('Please provide a trigger name');
      return false;
    }

    try {
      const { error } = await supabase.from('api_triggers').insert({
        user_id: user.id,
        name: newTrigger.name,
        method: newTrigger.method || 'POST',
        auth_type: newTrigger.auth_type || 'bearer',
        description: newTrigger.description,
        sample_payload: newTrigger.sample_payload,
      });

      if (error) throw error;

      toast.success('API trigger created successfully');
      fetchTriggers();
      return true;
    } catch (error) {
      console.error('Error creating trigger:', error);
      toast.error('Failed to create API trigger');
      return false;
    }
  };

  const toggleTrigger = async (id: string) => {
    const trigger = triggers.find(t => t.id === id);
    if (!trigger) return;

    try {
      const { error } = await supabase
        .from('api_triggers')
        .update({ is_active: !trigger.is_active })
        .eq('id', id);

      if (error) throw error;

      setTriggers(triggers.map(t =>
        t.id === id ? { ...t, is_active: !t.is_active } : t
      ));

      toast.success(`Trigger ${trigger.is_active ? 'disabled' : 'enabled'}`);
    } catch (error) {
      console.error('Error toggling trigger:', error);
      toast.error('Failed to update trigger');
    }
  };

  const deleteTrigger = async (id: string) => {
    try {
      const { error } = await supabase
        .from('api_triggers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTriggers(triggers.filter(t => t.id !== id));
      toast.success('API trigger deleted');
    } catch (error) {
      console.error('Error deleting trigger:', error);
      toast.error('Failed to delete trigger');
    }
  };

  const copyEndpoint = (endpointKey: string) => {
    const url = getWebhookUrl(endpointKey);
    navigator.clipboard.writeText(url);
    toast.success('Webhook URL copied to clipboard');
  };

  const testTrigger = async (trigger: ApiTrigger) => {
    const url = getWebhookUrl(trigger.endpoint_key);
    
    try {
      toast.info('Sending test request...');
      
      const response = await fetch(url, {
        method: trigger.method,
        headers: { 'Content-Type': 'application/json' },
        body: trigger.method !== 'GET' 
          ? JSON.stringify(trigger.sample_payload || { test: true, timestamp: new Date().toISOString() })
          : undefined
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Webhook test successful!');
        fetchTriggers();
      } else {
        toast.error(`Test failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Test failed:', error);
      toast.error('Failed to test webhook endpoint');
    }
  };

  return {
    triggers,
    isLoading,
    getWebhookUrl,
    createTrigger,
    toggleTrigger,
    deleteTrigger,
    copyEndpoint,
    testTrigger,
    refetch: fetchTriggers
  };
};
