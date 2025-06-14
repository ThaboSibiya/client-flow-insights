
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOptimisticMessages } from '@/hooks/useOptimisticUpdates';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useMessageSender = (conversationId: string) => {
  const { user } = useAuth();
  const [sendingMessage, setSendingMessage] = useState(false);
  const { sendMessageOptimistically } = useOptimisticMessages(conversationId);

  const sendMessage = useCallback(async (messageData: any) => {
    if (!user || !conversationId) return;

    setSendingMessage(true);
    
    try {
      const result = await sendMessageOptimistically(messageData, async () => {
        const { data, error } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            content: messageData.content,
            sender_type: messageData.sender_type,
            sender_name: messageData.sender_name,
            sender_email: messageData.sender_email,
            message_type: messageData.message_type,
            attachments: messageData.attachments || [],
            attachment_count: messageData.attachment_count || 0,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      });

      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setSendingMessage(false);
    }
  }, [user, conversationId, sendMessageOptimistically]);

  return {
    sendingMessage,
    sendMessage,
  };
};
