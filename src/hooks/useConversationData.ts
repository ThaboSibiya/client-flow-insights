
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useConversationData = (conversationId: string) => {
  const [conversation, setConversation] = useState<any>(null);

  const loadConversation = useCallback(async () => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (error) throw error;
      setConversation(data);
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversation details.',
        variant: 'destructive',
      });
    }
  }, [conversationId]);

  return {
    conversation,
    loadConversation,
  };
};
