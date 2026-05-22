import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CustomNode } from '@/components/pipeline/workflow/types';
import { Edge } from '@xyflow/react';
import { Json } from '@/integrations/supabase/types';

export interface WorkflowAutomation {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  nodes: CustomNode[];
  edges: Edge[];
  is_active: boolean;
  trigger_type: string | null;
  trigger_count: number;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

interface RawRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  nodes: Json;
  edges: Json;
  is_active: boolean;
  trigger_type: string | null;
  trigger_count: number;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

const parseRow = (row: RawRow): WorkflowAutomation => ({
  ...row,
  nodes: (row.nodes as unknown as CustomNode[]) || [],
  edges: (row.edges as unknown as Edge[]) || [],
});

export const useWorkflowAutomations = () => {
  const queryClient = useQueryClient();

  const { data: automations = [], isLoading } = useQuery({
    queryKey: ['workflow-automations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_automations')
        .select('id, user_id, name, description, nodes, edges, is_active, trigger_type, trigger_count, last_triggered_at, created_at, updated_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as RawRow[]).map(parseRow);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (input: { name: string; nodes?: CustomNode[]; edges?: Edge[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('workflow_automations')
        .insert({
          user_id: user.id,
          name: input.name,
          nodes: (input.nodes || []) as unknown as Json,
          edges: (input.edges || []) as unknown as Json,
        })
        .select()
        .single();
      if (error) throw error;
      return parseRow(data as RawRow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-automations'] });
      toast.success('Workflow created');
    },
    onError: () => toast.error('Failed to create workflow'),
  });

  const updateMutation = useMutation({
    mutationFn: async (input: { id: string; name?: string; nodes?: CustomNode[]; edges?: Edge[]; is_active?: boolean }) => {
      const updates: Record<string, unknown> = {};
      if (input.name !== undefined) updates.name = input.name;
      if (input.nodes !== undefined) updates.nodes = input.nodes as unknown as Json;
      if (input.edges !== undefined) updates.edges = input.edges as unknown as Json;
      if (input.is_active !== undefined) updates.is_active = input.is_active;

      const { error } = await supabase
        .from('workflow_automations')
        .update(updates)
        .eq('id', input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-automations'] });
    },
    onError: () => toast.error('Failed to update workflow'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('workflow_automations')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-automations'] });
      toast.success('Workflow deleted');
    },
    onError: () => toast.error('Failed to delete workflow'),
  });

  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      const source = automations.find(a => a.id === id);
      if (!source) throw new Error('Not found');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('workflow_automations')
        .insert({
          user_id: user.id,
          name: `${source.name} (Copy)`,
          nodes: source.nodes as unknown as Json,
          edges: source.edges as unknown as Json,
          is_active: false,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-automations'] });
      toast.success('Workflow duplicated');
    },
    onError: () => toast.error('Failed to duplicate workflow'),
  });

  return {
    automations,
    isLoading,
    createAutomation: createMutation.mutateAsync,
    updateAutomation: updateMutation.mutateAsync,
    deleteAutomation: deleteMutation.mutateAsync,
    duplicateAutomation: duplicateMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
};
