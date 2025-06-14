
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface TypingUser {
  user_id: string;
  user_name: string;
  timestamp: number;
}

export const useTypingIndicator = (conversationId: string) => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    if (!conversationId || !user) return;

    const typingChannel = supabase.channel(`typing-${conversationId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = typingChannel.presenceState();
        const users: TypingUser[] = [];
        
        Object.keys(state).forEach(key => {
          const presences = state[key];
          presences.forEach((presence: any) => {
            if (presence.user_id !== user.id) {
              users.push({
                user_id: presence.user_id,
                user_name: presence.user_name,
                timestamp: presence.timestamp
              });
            }
          });
        });
        
        setTypingUsers(users);
      })
      .subscribe();

    setChannel(typingChannel);

    return () => {
      if (typingChannel) {
        supabase.removeChannel(typingChannel);
      }
    };
  }, [conversationId, user]);

  const startTyping = useCallback(() => {
    if (!channel || !user) return;

    channel.track({
      user_id: user.id,
      user_name: user.email || 'Unknown User',
      timestamp: Date.now()
    });
  }, [channel, user]);

  const stopTyping = useCallback(() => {
    if (!channel) return;
    channel.untrack();
  }, [channel]);

  // Auto-cleanup typing after 3 seconds of inactivity
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTypingUsers(prev => 
        prev.filter(user => Date.now() - user.timestamp < 3000)
      );
    }, 1000);

    return () => clearTimeout(timeout);
  }, [typingUsers]);

  return {
    typingUsers,
    startTyping,
    stopTyping
  };
};
