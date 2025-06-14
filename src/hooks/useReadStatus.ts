
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useReadStatus = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const markMessagesAsRead = useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to mark messages as read",
        variant: "destructive",
      });
    },
  });

  const markConversationAsRead = useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      if (error) throw error;

      // Also mark all messages in conversation as read
      await markMessagesAsRead.mutateAsync(conversationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to update conversation status",
        variant: "destructive",
      });
    },
  });

  return {
    markMessagesAsRead: markMessagesAsRead.mutate,
    markConversationAsRead: markConversationAsRead.mutate,
    isMarkingAsRead: markMessagesAsRead.isPending || markConversationAsRead.isPending
  };
};
