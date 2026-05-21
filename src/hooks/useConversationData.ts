
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useActiveWorkspaceId } from '@/hooks/useActiveWorkspaceId';

export const useConversationData = (conversationId: string) => {
  const [conversation, setConversation] = useState<any>(null);
  const workspaceId = useActiveWorkspaceId();

  const loadConversation = useCallback(async () => {
    if (!conversationId) return;

    try {
      let query = supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId);

      if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      if (!data) {
        // Fail closed when the conversation is not in the active workspace
        setConversation(null);
        return;
      }
      setConversation(data);
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversation details.',
        variant: 'destructive',
      });
    }
  }, [conversationId, workspaceId]);

  return {
    conversation,
    loadConversation,
  };
};
