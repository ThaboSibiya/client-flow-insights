
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useMessages = (conversationId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: conversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!conversationId,
  });

  const { data: messages, isLoading: loading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!conversationId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: {
      content: string;
      message_type: string;
      sender_type: string;
      sender_name: string;
      sender_email?: string;
      attachments?: any[];
      attachment_count?: number;
    }) => {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          content: messageData.content,
          message_type: messageData.message_type,
          sender_type: messageData.sender_type,
          sender_name: messageData.sender_name,
          sender_email: messageData.sender_email,
          attachments: messageData.attachments,
          attachment_count: messageData.attachment_count || 0,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendMessage = (messageData: any) => {
    sendMessageMutation.mutate(messageData);
  };

  return {
    conversation,
    messages,
    loading,
    sendMessage,
    sendingMessage: sendMessageMutation.isPending,
  };
};
