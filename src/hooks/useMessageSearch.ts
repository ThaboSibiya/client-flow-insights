
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useMessageSearch = (conversationId: string) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useAuth();

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['messageSearch', conversationId, searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim() || !user) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .ilike('content', `%${searchQuery}%`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!searchQuery.trim() && !!conversationId && !!user,
  });

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  return {
    searchQuery,
    setSearchQuery,
    isSearching,
    setIsSearching,
    searchResults: searchResults || [],
    isLoading,
    clearSearch,
  };
};
