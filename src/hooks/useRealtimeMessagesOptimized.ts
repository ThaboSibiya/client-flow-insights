
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { simplifiedMessageCache } from '@/services/simplifiedMessageCache';
import type { Message } from '@/types/conversations';

export const useRealtimeMessagesOptimized = (
  conversationId: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  const { user } = useAuth();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // Only add if not from current user to avoid duplicates
          if (newMessage.sender_email !== user?.email) {
            setMessages(prev => {
              const exists = prev.some(m => m.id === newMessage.id);
              if (exists) return prev;
              
              const updated = [...prev, newMessage];
              // Update cache asynchronously
              setTimeout(() => {
                simplifiedMessageCache.cacheMessages(conversationId, updated);
              }, 0);
              
              return updated;
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.error('Real-time subscription error for conversation:', conversationId);
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId, user?.email, setMessages]);

  return {
    isConnected: channelRef.current?.state === 'joined'
  };
};
