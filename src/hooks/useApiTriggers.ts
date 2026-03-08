import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

const SUPABASE_PROJECT_REF = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'oquiaxbnkdnpixqhqdfq';

export const useApiTriggers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['api-triggers', user?.id];

  const getWebhookUrl = (endpointKey: string) => {
    return `https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1/webhook-receiver/${endpointKey}`;
  };

  const { data: triggers = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('api_triggers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(trigger => ({
        ...trigger,
        sample_payload: trigger.sample_payload as Record<string, any> | null,
      })) as ApiTrigger[];
    },
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (newTrigger: NewApiTrigger) => {
      if (!user) throw new Error('Not authenticated');
      if (!newTrigger.name) throw new Error('Name required');

      const { error } = await supabase.from('api_triggers').insert({
        user_id: user.id,
        name: newTrigger.name,
        method: newTrigger.method || 'POST',
        auth_type: newTrigger.auth_type || 'bearer',
        description: newTrigger.description,
        sample_payload: newTrigger.sample_payload,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('API trigger created successfully');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      console.error('Error creating trigger:', error);
      toast.error('Failed to create API trigger');
    },
  });

  const createTrigger = async (newTrigger: NewApiTrigger): Promise<boolean> => {
    try {
      await createMutation.mutateAsync(newTrigger);
      return true;
    } catch {
      return false;
    }
  };

  const toggleTrigger = async (id: string) => {
    const trigger = triggers.find(t => t.id === id);
    if (!trigger) return;

    // Optimistic update
    queryClient.setQueryData(queryKey, (old: ApiTrigger[] | undefined) =>
      (old || []).map(t => t.id === id ? { ...t, is_active: !t.is_active } : t)
    );

    try {
      const { error } = await supabase
        .from('api_triggers')
        .update({ is_active: !trigger.is_active })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Trigger ${trigger.is_active ? 'disabled' : 'enabled'}`);
    } catch (error) {
      console.error('Error toggling trigger:', error);
      toast.error('Failed to update trigger');
      queryClient.invalidateQueries({ queryKey });
    }
  };

  const deleteTrigger = async (id: string) => {
    // Optimistic removal
    queryClient.setQueryData(queryKey, (old: ApiTrigger[] | undefined) =>
      (old || []).filter(t => t.id !== id)
    );

    try {
      const { error } = await supabase
        .from('api_triggers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('API trigger deleted');
    } catch (error) {
      console.error('Error deleting trigger:', error);
      toast.error('Failed to delete trigger');
      queryClient.invalidateQueries({ queryKey });
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
        queryClient.invalidateQueries({ queryKey });
        queryClient.invalidateQueries({ queryKey: ['webhook-logs'] });
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
    refetch: () => queryClient.invalidateQueries({ queryKey }),
  };
};
