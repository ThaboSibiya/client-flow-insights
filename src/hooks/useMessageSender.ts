
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOptimisticMessages } from '@/hooks/useOptimisticUpdates';
import { useChannelDispatcher } from '@/hooks/useChannelDispatcher';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useMessageSender = (conversationId: string) => {
  const { user } = useAuth();
  const [sendingMessage, setSendingMessage] = useState(false);
  const { sendMessageOptimistically } = useOptimisticMessages(conversationId);
  const { dispatchToChannel } = useChannelDispatcher();

  const sendMessage = useCallback(async (messageData: any) => {
    if (!user || !conversationId) return;

    setSendingMessage(true);
    
    try {
      // 1. Save to database (optimistic)
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

      // 2. Dispatch to external channel (non-blocking for internal notes)
      if (messageData.message_type !== 'internal_note') {
        // Fetch conversation to determine type and get recipient info
        const { data: conversation } = await supabase
          .from('conversations')
          .select('type, customer_id, customers(email, phone)')
          .eq('id', conversationId)
          .single();

        if (conversation) {
          const customer = conversation.customers as any;
          const dispatchResult = await dispatchToChannel(
            conversation.type,
            conversationId,
            messageData.content,
            {
              email: customer?.email,
              phone: customer?.phone,
              chatId: customer?.phone, // Telegram chat ID stored in phone for now
            }
          );

          if (!dispatchResult.success && dispatchResult.error) {
            // Message saved to DB but channel delivery failed — warn user
            toast({
              title: 'Message saved',
              description: `Delivery warning: ${dispatchResult.error}. The message is saved but may not have reached the recipient.`,
              variant: 'default',
            });
          }
        }
      }

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
  }, [user, conversationId, sendMessageOptimistically, dispatchToChannel]);

  return {
    sendingMessage,
    sendMessage,
  };
};
