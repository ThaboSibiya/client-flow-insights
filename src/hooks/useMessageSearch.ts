
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useMessageSearch = (conversationId: string) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    const searchMessages = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .ilike('content', `%${searchQuery}%`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSearchResults(data || []);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchMessages, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, conversationId]);

  return {
    searchQuery,
    setSearchQuery,
    isSearching,
    setIsSearching,
    searchResults,
    isLoading,
    clearSearch,
  };
};
