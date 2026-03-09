
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useReadStatus = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const markMessageAsRead = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: (_, messageId) => {
      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to mark message as read",
        variant: "destructive",
      });
    },
  });

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

  const markAllAsRead = useMutation({
    mutationFn: async (conversationId: string) => {
      // Use the DB function that resets unread_count + marks messages read atomically
      const { error } = await supabase.rpc('reset_conversation_unread', {
        p_conversation_id: conversationId,
      });

      if (error) throw error;
    },
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: "Success",
        description: "All messages marked as read",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to mark all messages as read",
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
    markMessageAsRead: markMessageAsRead.mutate,
    markMessagesAsRead: markMessagesAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
    markConversationAsRead: markConversationAsRead.mutate,
    isMarkingAsRead: markMessageAsRead.isPending || markMessagesAsRead.isPending || markAllAsRead.isPending || markConversationAsRead.isPending
  };
};
