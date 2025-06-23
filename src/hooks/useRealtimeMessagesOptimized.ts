
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { messageCacheService } from '@/services/messageCacheService';

// Connection pool to prevent duplicate subscriptions
const connectionPool = new Map();

export const useRealtimeMessagesOptimized = (
  conversationId: string,
  setMessages: React.Dispatch<React.SetStateAction<any[]>>
) => {
  const { user } = useAuth();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!conversationId) return;

    // Check if we already have a connection for this conversation
    const existingChannel = connectionPool.get(conversationId);
    if (existingChannel) {
      channelRef.current = existingChannel;
      return;
    }

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
          const newMessage = payload.new;
          
          // Only add if not from current user (avoid duplicates from optimistic updates)
          if (newMessage.sender_email !== user?.email) {
            setMessages(prev => {
              const exists = prev.some(m => m.id === newMessage.id);
              if (exists) return prev;
              return [...prev, newMessage];
            });
            
            // Non-blocking cache update
            setTimeout(() => {
              messageCacheService.cacheMessage(conversationId, newMessage);
            }, 0);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
    connectionPool.set(conversationId, channel);

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        connectionPool.delete(conversationId);
      }
    };
  }, [conversationId, user?.email, setMessages]);
};
