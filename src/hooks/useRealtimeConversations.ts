
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useRealtimeConversations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!user?.id) return;

    // Create realtime channel for conversations
    const channel = supabase
      .channel('conversations-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
          filter: `company_owner_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New conversation:', payload);
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `company_owner_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Conversation updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('New message:', payload);
          // Invalidate both conversations and specific conversation messages
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.invalidateQueries({ 
            queryKey: ['messages', payload.new.conversation_id] 
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user?.id, queryClient]);

  return {
    isConnected: channelRef.current?.state === 'joined'
  };
};
