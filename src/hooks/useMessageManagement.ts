
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export const useMessageManagement = (conversationId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const deleteMessage = useMutation({
    mutationFn: async (messageId: string) => {
      // First check if user has permission to delete this message
      const { data: message } = await supabase
        .from('messages')
        .select('sender_id, sender_email, created_at')
        .eq('id', messageId)
        .single();

      if (!message) throw new Error('Message not found');

      // Allow deletion if user is the sender or within 5 minutes of creation
      const isOwner = message.sender_email === user?.email;
      const createdAt = new Date(message.created_at);
      const now = new Date();
      const timeDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60); // minutes
      const withinTimeLimit = timeDiff <= 5;

      if (!isOwner || !withinTimeLimit) {
        throw new Error('You can only delete your own messages within 5 minutes of sending');
      }

      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete message",
        variant: "destructive",
      });
    },
  });

  const editMessage = useMutation({
    mutationFn: async ({ messageId, newContent }: { messageId: string; newContent: string }) => {
      // First check if user has permission to edit this message
      const { data: message } = await supabase
        .from('messages')
        .select('sender_id, sender_email, created_at')
        .eq('id', messageId)
        .single();

      if (!message) throw new Error('Message not found');

      // Allow editing if user is the sender and within 15 minutes of creation
      const isOwner = message.sender_email === user?.email;
      const createdAt = new Date(message.created_at);
      const now = new Date();
      const timeDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60); // minutes
      const withinTimeLimit = timeDiff <= 15;

      if (!isOwner || !withinTimeLimit) {
        throw new Error('You can only edit your own messages within 15 minutes of sending');
      }

      const { error } = await supabase
        .from('messages')
        .update({ 
          content: newContent,
          metadata: { 
            edited: true, 
            edited_at: new Date().toISOString() 
          }
        })
        .eq('id', messageId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      toast({
        title: "Success",
        description: "Message updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to edit message",
        variant: "destructive",
      });
    },
  });

  return {
    deleteMessage: deleteMessage.mutate,
    editMessage: editMessage.mutate,
    isDeletingMessage: deleteMessage.isPending,
    isEditingMessage: editMessage.isPending,
  };
};
