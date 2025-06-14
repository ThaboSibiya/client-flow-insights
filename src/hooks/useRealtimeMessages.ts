
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { messageCacheService } from '@/services/messageCacheService';

export const useRealtimeMessages = (
  conversationId: string,
  setMessages: React.Dispatch<React.SetStateAction<any[]>>
) => {
  const { user } = useAuth();

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
          const newMessage = payload.new;
          
          // Only add if not from current user (avoid duplicates from optimistic updates)
          if (newMessage.sender_email !== user?.email) {
            setMessages(prev => {
              const exists = prev.some(m => m.id === newMessage.id);
              if (exists) return prev;
              return [...prev, newMessage];
            });
            
            // Update cache
            messageCacheService.cacheMessage(conversationId, newMessage);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user?.email, setMessages]);
};
