
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DispatchResult {
  success: boolean;
  error?: string;
  messageId?: string;
}

/**
 * Routes outbound messages to the correct channel Edge Function
 * based on conversation type (email, whatsapp, telegram).
 * Internal chats and form submissions are DB-only (no external dispatch).
 */
export const useChannelDispatcher = () => {
  const dispatchToChannel = useCallback(async (
    conversationType: string,
    conversationId: string,
    content: string,
    recipientInfo?: { email?: string; phone?: string; chatId?: string }
  ): Promise<DispatchResult> => {
    try {
      switch (conversationType) {
        case 'email': {
          if (!recipientInfo?.email) {
            return { success: true }; // No recipient — DB-only
          }
          const { data, error } = await supabase.functions.invoke('send-transactional-email', {
            body: {
              to: recipientInfo.email,
              subject: `Re: Conversation`,
              message: content,
              senderName: 'Support Team',
            },
          });
          if (error) {
            console.error('Email dispatch error:', error);
            return { success: false, error: error.message };
          }
          return { success: true, messageId: data?.id };
        }

        case 'whatsapp': {
          if (!recipientInfo?.phone) {
            return { success: true }; // No recipient — DB-only
          }
          const { data, error } = await supabase.functions.invoke('send-whatsapp', {
            body: {
              phoneNumber: recipientInfo.phone,
              message: content,
              conversationId,
            },
          });
          if (error) {
            console.error('WhatsApp dispatch error:', error);
            return { success: false, error: error.message };
          }
          return { success: true, messageId: data?.messageSid };
        }

        case 'telegram': {
          if (!recipientInfo?.chatId) {
            return { success: true }; // No recipient — DB-only
          }
          const { data, error } = await supabase.functions.invoke('send-telegram', {
            body: {
              chatId: recipientInfo.chatId,
              message: content,
              conversationId,
            },
          });
          if (error) {
            console.error('Telegram dispatch error:', error);
            return { success: false, error: error.message };
          }
          return { success: true, messageId: data?.messageId };
        }

        case 'internal_chat':
        case 'form_submission':
        default:
          // Internal / form — no external dispatch needed
          return { success: true };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Channel dispatch failed';
      console.error('Channel dispatch error:', message);
      return { success: false, error: message };
    }
  }, []);

  return { dispatchToChannel };
};
