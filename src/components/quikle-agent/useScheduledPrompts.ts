import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useActiveWorkspaceId } from '@/hooks/useActiveWorkspaceId';
import { toast } from '@/hooks/use-toast';

export type ScheduledFrequency = 'daily' | 'weekdays' | 'weekly' | 'monthly';

export interface ScheduledPrompt {
  id: string;
  user_id: string;
  workspace_id: string;
  name: string;
  prompt: string;
  frequency: ScheduledFrequency;
  time_of_day: string;
  day_of_week: number | null;
  day_of_month: number | null;
  timezone: string;
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string;
  last_result_summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScheduledPromptInput {
  name: string;
  prompt: string;
  frequency: ScheduledFrequency;
  time_of_day: string;
  day_of_week?: number | null;
  day_of_month?: number | null;
}

/** Compute next_run_at locally so the runner picks it up at the right time. */
const computeNextRunAt = (input: ScheduledPromptInput): string => {
  const [hh, mm] = input.time_of_day.split(':').map(Number);
  const now = new Date();
  const candidate = new Date(now);
  candidate.setUTCHours(hh, mm, 0, 0);

  const addDays = (n: number) => candidate.setUTCDate(candidate.getUTCDate() + n);

  if (input.frequency === 'daily') {
    if (candidate <= now) addDays(1);
  } else if (input.frequency === 'weekdays') {
    if (candidate <= now) addDays(1);
    while (candidate.getUTCDay() === 0 || candidate.getUTCDay() === 6) addDays(1);
  } else if (input.frequency === 'weekly') {
    const target = input.day_of_week ?? 1;
    const delta = (target - candidate.getUTCDay() + 7) % 7;
    if (delta > 0) addDays(delta);
    if (candidate <= now) addDays(7);
  } else if (input.frequency === 'monthly') {
    const target = input.day_of_month ?? 1;
    candidate.setUTCDate(target);
    if (candidate <= now) {
      candidate.setUTCMonth(candidate.getUTCMonth() + 1);
      candidate.setUTCDate(target);
    }
  }
  return candidate.toISOString();
};

export const useScheduledPrompts = () => {
  const qc = useQueryClient();
  const workspaceId = useActiveWorkspaceId();

  const query = useQuery({
    queryKey: ['agent-scheduled-prompts'],
    queryFn: async (): Promise<ScheduledPrompt[]> => {
      const { data, error } = await supabase
        .from('agent_scheduled_prompts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ScheduledPrompt[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (input: ScheduledPromptInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      if (!workspaceId) throw new Error('No active workspace');

      const next_run_at = computeNextRunAt(input);
      const { error } = await supabase.from('agent_scheduled_prompts').insert({
        user_id: user.id,
        workspace_id: workspaceId,
        name: input.name.trim(),
        prompt: input.prompt.trim(),
        frequency: input.frequency,
        time_of_day: input.time_of_day,
        day_of_week: input.day_of_week ?? null,
        day_of_month: input.day_of_month ?? null,
        next_run_at,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agent-scheduled-prompts'] });
      toast({ title: 'Scheduled', description: 'Quikle will run this prompt on schedule.' });
    },
    onError: (e: Error) => toast({ title: 'Could not schedule', description: e.message, variant: 'destructive' }),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('agent_scheduled_prompts')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agent-scheduled-prompts'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agent_scheduled_prompts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agent-scheduled-prompts'] });
      toast({ title: 'Schedule removed' });
    },
  });

  return {
    prompts: query.data ?? [],
    isLoading: query.isLoading,
    create: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    toggle: toggleMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
  };
};
