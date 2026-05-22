import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export interface PipelineStage {
  id: string;
  user_id: string;
  pipeline_type: 'customer' | 'ticket';
  name: string;
  color: string;
  position: number;
  target?: number;
  automation_enabled: boolean;
  status_mapping?: string;
  description?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface StageAutomation {
  id: string;
  user_id: string;
  stage_id: string;
  name: string;
  trigger_type: 'on_entry' | 'on_exit' | 'time_based';
  trigger_config: Record<string, any>;
  actions: any[];
  conditions: any[];
  is_active: boolean;
  execution_count: number;
  last_executed_at?: string;
  created_at: string;
  updated_at: string;
}

// Default stages for new users
const DEFAULT_CUSTOMER_STAGES = [
  { name: 'New Leads', color: '#6B7280', position: 0, status_mapping: 'new', is_default: true },
  { name: 'Contacted', color: '#374151', position: 1, status_mapping: 'pending', is_default: true },
  { name: 'Qualified', color: '#059669', position: 2, status_mapping: 'existing', is_default: true },
  { name: 'Closed Won', color: '#1F2937', position: 3, status_mapping: 'finalised', is_default: true },
];

const DEFAULT_TICKET_STAGES = [
  { name: 'New Tickets', color: '#DC2626', position: 0, status_mapping: 'open', is_default: true },
  { name: 'In Progress', color: '#6B7280', position: 1, status_mapping: 'in-progress', is_default: true },
  { name: 'Under Review', color: '#374151', position: 2, status_mapping: 'review', is_default: true },
  { name: 'Resolved', color: '#059669', position: 3, status_mapping: 'resolved', is_default: true },
  { name: 'Closed', color: '#1F2937', position: 4, status_mapping: 'closed', is_default: true },
];

export const usePipelineStages = (pipelineType: 'customer' | 'ticket') => {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [automations, setAutomations] = useState<StageAutomation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch stages from database
  const fetchStages = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('id, user_id, pipeline_type, name, color, position, target, automation_enabled, status_mapping, description, is_default, created_at, updated_at')
        .eq('user_id', user.id)
        .eq('pipeline_type', pipelineType)
        .order('position', { ascending: true });

      if (error) throw error;

      // If no stages exist, create default stages
      if (!data || data.length === 0) {
        await createDefaultStages();
      } else {
        setStages(data as PipelineStage[]);
      }
    } catch (error: any) {
      console.error('Error fetching pipeline stages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pipeline stages',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, pipelineType, toast]);

  // Create default stages for new users
  const createDefaultStages = async () => {
    if (!user?.id) return;

    const defaultStages = pipelineType === 'customer' 
      ? DEFAULT_CUSTOMER_STAGES 
      : DEFAULT_TICKET_STAGES;

    try {
      const stagesToCreate = defaultStages.map(stage => ({
        ...stage,
        user_id: user.id,
        pipeline_type: pipelineType,
        automation_enabled: false,
      }));

      const { data, error } = await supabase
        .from('pipeline_stages')
        .insert(stagesToCreate)
        .select();

      if (error) throw error;

      setStages(data as PipelineStage[]);
    } catch (error: any) {
      console.error('Error creating default stages:', error);
    }
  };

  // Fetch automations for stages
  const fetchAutomations = useCallback(async () => {
    if (!user?.id || stages.length === 0) return;

    try {
      const stageIds = stages.map(s => s.id);
      const { data, error } = await supabase
        .from('stage_automations')
        .select('*')
        .eq('user_id', user.id)
        .in('stage_id', stageIds);

      if (error) throw error;

      setAutomations(data as StageAutomation[]);
    } catch (error: any) {
      console.error('Error fetching automations:', error);
    }
  }, [user?.id, stages]);

  // Add a new stage
  const addStage = useCallback(async (name: string, color: string, statusMapping?: string) => {
    if (!user?.id) return null;

    const newPosition = stages.length;

    try {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .insert({
          user_id: user.id,
          pipeline_type: pipelineType,
          name,
          color,
          position: newPosition,
          status_mapping: statusMapping,
          automation_enabled: false,
          is_default: false,
        })
        .select()
        .single();

      if (error) throw error;

      setStages(prev => [...prev, data as PipelineStage]);
      toast({
        title: 'Success',
        description: 'Stage created successfully',
      });

      return data as PipelineStage;
    } catch (error: any) {
      console.error('Error creating stage:', error);
      toast({
        title: 'Error',
        description: 'Failed to create stage',
        variant: 'destructive',
      });
      return null;
    }
  }, [user?.id, pipelineType, stages.length, toast]);

  // Update a stage
  const updateStage = useCallback(async (stageId: string, updates: Partial<PipelineStage>) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('pipeline_stages')
        .update(updates)
        .eq('id', stageId)
        .eq('user_id', user.id);

      if (error) throw error;

      setStages(prev => prev.map(stage => 
        stage.id === stageId ? { ...stage, ...updates } : stage
      ));

      return true;
    } catch (error: any) {
      console.error('Error updating stage:', error);
      toast({
        title: 'Error',
        description: 'Failed to update stage',
        variant: 'destructive',
      });
      return false;
    }
  }, [user?.id, toast]);

  // Delete a stage
  const deleteStage = useCallback(async (stageId: string) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('pipeline_stages')
        .delete()
        .eq('id', stageId)
        .eq('user_id', user.id);

      if (error) throw error;

      setStages(prev => prev.filter(stage => stage.id !== stageId));
      toast({
        title: 'Success',
        description: 'Stage deleted successfully',
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting stage:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete stage',
        variant: 'destructive',
      });
      return false;
    }
  }, [user?.id, toast]);

  // Reorder stages
  const reorderStages = useCallback(async (newOrder: string[]) => {
    if (!user?.id) return false;

    try {
      // Update positions in database
      const updates = newOrder.map((stageId, index) => ({
        id: stageId,
        user_id: user.id,
        position: index,
      }));

      for (const update of updates) {
        await supabase
          .from('pipeline_stages')
          .update({ position: update.position })
          .eq('id', update.id)
          .eq('user_id', user.id);
      }

      // Update local state
      setStages(prev => {
        const stageMap = new Map(prev.map(s => [s.id, s]));
        return newOrder
          .map((id, index) => {
            const stage = stageMap.get(id);
            return stage ? { ...stage, position: index } : null;
          })
          .filter(Boolean) as PipelineStage[];
      });

      return true;
    } catch (error: any) {
      console.error('Error reordering stages:', error);
      return false;
    }
  }, [user?.id]);

  // Add automation to stage
  const addAutomation = useCallback(async (
    stageId: string, 
    name: string, 
    triggerType: 'on_entry' | 'on_exit' | 'time_based',
    actions: any[],
    conditions?: any[]
  ) => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase
        .from('stage_automations')
        .insert({
          user_id: user.id,
          stage_id: stageId,
          name,
          trigger_type: triggerType,
          actions,
          conditions: conditions || [],
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setAutomations(prev => [...prev, data as StageAutomation]);

      // Enable automation on stage
      await updateStage(stageId, { automation_enabled: true });

      toast({
        title: 'Success',
        description: 'Automation created successfully',
      });

      return data as StageAutomation;
    } catch (error: any) {
      console.error('Error creating automation:', error);
      toast({
        title: 'Error',
        description: 'Failed to create automation',
        variant: 'destructive',
      });
      return null;
    }
  }, [user?.id, toast, updateStage]);

  // Log pipeline activity
  const logActivity = useCallback(async (
    entityId: string,
    entityType: 'customer' | 'ticket',
    fromStageId: string | null,
    toStageId: string | null,
    actionType: string,
    metadata?: Record<string, any>
  ) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('pipeline_activity')
        .insert({
          user_id: user.id,
          pipeline_type: pipelineType,
          entity_id: entityId,
          entity_type: entityType,
          from_stage_id: fromStageId,
          to_stage_id: toStageId,
          action_type: actionType,
          metadata: metadata || {},
        });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }, [user?.id, pipelineType]);

  // Get status mapping for a stage
  const getStatusMapping = useCallback((stageId: string): string | null => {
    const stage = stages.find(s => s.id === stageId);
    return stage?.status_mapping || null;
  }, [stages]);

  // Get stage by status
  const getStageByStatus = useCallback((status: string): PipelineStage | null => {
    return stages.find(s => s.status_mapping === status) || null;
  }, [stages]);

  useEffect(() => {
    fetchStages();
  }, [fetchStages]);

  useEffect(() => {
    if (stages.length > 0) {
      fetchAutomations();
    }
  }, [stages.length, fetchAutomations]);

  return {
    stages,
    automations,
    isLoading,
    addStage,
    updateStage,
    deleteStage,
    reorderStages,
    addAutomation,
    logActivity,
    getStatusMapping,
    getStageByStatus,
    refetch: fetchStages,
  };
};
