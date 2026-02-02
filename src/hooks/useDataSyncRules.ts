import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export interface DataSyncRule {
  id: string;
  name: string;
  source_system: string;
  target_system: string;
  data_type: string;
  sync_direction: 'push' | 'pull' | 'bidirectional';
  frequency: 'real-time' | 'hourly' | 'daily' | 'manual';
  is_active: boolean;
  status: 'active' | 'inactive' | 'error' | 'syncing';
  sync_count: number;
  last_sync_at: string | null;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface NewDataSyncRule {
  name: string;
  source_system: string;
  target_system: string;
  data_type: string;
  sync_direction: 'push' | 'pull' | 'bidirectional';
  frequency: 'real-time' | 'hourly' | 'daily' | 'manual';
  config?: Record<string, any>;
}

export const useDataSyncRules = () => {
  const [syncRules, setSyncRules] = useState<DataSyncRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchSyncRules = async () => {
    if (!user) {
      setSyncRules([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('data_sync_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSyncRules((data || []).map(rule => ({
        ...rule,
        sync_direction: rule.sync_direction as 'push' | 'pull' | 'bidirectional',
        frequency: rule.frequency as 'real-time' | 'hourly' | 'daily' | 'manual',
        status: rule.status as 'active' | 'inactive' | 'error' | 'syncing',
        config: (rule.config as Record<string, any>) || {},
      })));
    } catch (error) {
      console.error('Error fetching sync rules:', error);
      toast.error('Failed to load sync rules');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSyncRules();
  }, [user]);

  const createSyncRule = async (newRule: NewDataSyncRule): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to create sync rules');
      return false;
    }

    if (!newRule.name || !newRule.source_system || !newRule.target_system) {
      toast.error('Please fill in all required fields');
      return false;
    }

    try {
      const { error } = await supabase.from('data_sync_rules').insert({
        user_id: user.id,
        name: newRule.name,
        source_system: newRule.source_system,
        target_system: newRule.target_system,
        data_type: newRule.data_type,
        sync_direction: newRule.sync_direction,
        frequency: newRule.frequency,
        config: newRule.config || {},
      });

      if (error) throw error;

      toast.success('Sync rule created successfully');
      fetchSyncRules();
      return true;
    } catch (error) {
      console.error('Error creating sync rule:', error);
      toast.error('Failed to create sync rule');
      return false;
    }
  };

  const toggleSyncRule = async (id: string) => {
    const rule = syncRules.find(r => r.id === id);
    if (!rule) return;

    try {
      const newStatus = rule.is_active ? 'inactive' : 'active';
      const { error } = await supabase
        .from('data_sync_rules')
        .update({ 
          is_active: !rule.is_active,
          status: newStatus as 'active' | 'inactive'
        })
        .eq('id', id);

      if (error) throw error;

      setSyncRules(syncRules.map(r =>
        r.id === id ? { ...r, is_active: !r.is_active, status: newStatus as 'active' | 'inactive' } : r
      ));

      toast.success(`Sync rule ${rule.is_active ? 'disabled' : 'enabled'}`);
    } catch (error) {
      console.error('Error toggling sync rule:', error);
      toast.error('Failed to update sync rule');
    }
  };

  const deleteSyncRule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('data_sync_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSyncRules(syncRules.filter(r => r.id !== id));
      toast.success('Sync rule deleted');
    } catch (error) {
      console.error('Error deleting sync rule:', error);
      toast.error('Failed to delete sync rule');
    }
  };

  const triggerManualSync = async (rule: DataSyncRule) => {
    try {
      // Update status to syncing
      setSyncRules(syncRules.map(r =>
        r.id === rule.id ? { ...r, status: 'syncing' as const } : r
      ));

      await supabase
        .from('data_sync_rules')
        .update({ status: 'syncing' })
        .eq('id', rule.id);

      toast.info(`Syncing ${rule.data_type} between ${rule.source_system} and ${rule.target_system}...`);

      // Simulate sync (in real implementation, this would call actual sync logic)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { error } = await supabase
        .from('data_sync_rules')
        .update({ 
          status: 'active',
          sync_count: rule.sync_count + 1,
          last_sync_at: new Date().toISOString()
        })
        .eq('id', rule.id);

      if (error) throw error;

      fetchSyncRules();
      toast.success('Sync completed successfully');
    } catch (error) {
      console.error('Error during manual sync:', error);
      
      await supabase
        .from('data_sync_rules')
        .update({ status: 'error' })
        .eq('id', rule.id);
      
      fetchSyncRules();
      toast.error('Sync failed');
    }
  };

  return {
    syncRules,
    isLoading,
    createSyncRule,
    toggleSyncRule,
    deleteSyncRule,
    triggerManualSync,
    refetch: fetchSyncRules
  };
};
