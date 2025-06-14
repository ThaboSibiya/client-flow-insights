
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useConversations = () => {
  const { user } = useAuth();

  const { data: conversations, isLoading: loading, error } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          messages (
            id,
            content,
            created_at,
            is_read,
            sender_name
          )
        `)
        .eq('company_owner_id', user.id)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Add unread count and last message preview
      const conversationsWithMetadata = data?.map(conv => ({
        ...conv,
        unread_count: conv.messages?.filter((msg: any) => !msg.is_read).length || 0,
        last_message_preview: conv.messages?.[conv.messages.length - 1]?.content?.substring(0, 50) + '...' || '',
      }));

      return conversationsWithMetadata;
    },
    enabled: !!user,
  });

  const unreadCount = conversations?.reduce((total, conv) => total + (conv.unread_count || 0), 0) || 0;

  return {
    conversations,
    loading,
    error,
    unreadCount,
  };
};
