
import { useState, useCallback } from 'react';
import { messageCacheService } from '@/services/messageCacheService';

interface OptimisticUpdate<T> {
  id: string;
  data: T;
  pending: boolean;
  error?: string;
}

export const useOptimisticUpdates = <T>() => {
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, OptimisticUpdate<T>>>(
    new Map()
  );

  const addOptimisticUpdate = useCallback((id: string, data: T) => {
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev);
      newMap.set(id, { id, data, pending: true });
      return newMap;
    });
  }, []);

  const resolveOptimisticUpdate = useCallback((id: string, finalData?: T) => {
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev);
      if (finalData) {
        newMap.set(id, { id, data: finalData, pending: false });
      } else {
        newMap.delete(id);
      }
      return newMap;
    });
  }, []);

  const rejectOptimisticUpdate = useCallback((id: string, error: string) => {
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev);
      const update = newMap.get(id);
      if (update) {
        newMap.set(id, { ...update, pending: false, error });
      }
      return newMap;
    });
  }, []);

  const clearOptimisticUpdate = useCallback((id: string) => {
    setOptimisticUpdates(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  const mergeWithOptimisticUpdates = useCallback((serverData: T[], keyExtractor: (item: T) => string): T[] => {
    const result = [...serverData];
    
    // Add optimistic updates that aren't in server data yet
    for (const [id, update] of optimisticUpdates) {
      const existsInServer = serverData.some(item => keyExtractor(item) === id);
      if (!existsInServer && update.pending && !update.error) {
        result.push(update.data);
      }
    }

    return result;
  }, [optimisticUpdates]);

  return {
    optimisticUpdates: Array.from(optimisticUpdates.values()),
    addOptimisticUpdate,
    resolveOptimisticUpdate,
    rejectOptimisticUpdate,
    clearOptimisticUpdate,
    mergeWithOptimisticUpdates,
  };
};

/**
 * Hook specifically for optimistic message updates
 */
export const useOptimisticMessages = (conversationId: string) => {
  const {
    optimisticUpdates,
    addOptimisticUpdate,
    resolveOptimisticUpdate,
    rejectOptimisticUpdate,
    mergeWithOptimisticUpdates,
  } = useOptimisticUpdates<any>();

  const sendMessageOptimistically = useCallback(async (
    messageData: any,
    sendFunction: () => Promise<any>
  ) => {
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMessage = {
      ...messageData,
      id: tempId,
      created_at: new Date().toISOString(),
      pending: true,
    };

    // Add to optimistic updates and cache
    addOptimisticUpdate(tempId, optimisticMessage);
    messageCacheService.cacheMessage(conversationId, optimisticMessage);

    try {
      const result = await sendFunction();
      
      // Remove temporary message from cache and replace with real one
      messageCacheService.removeCachedMessage(conversationId, tempId);
      if (result) {
        messageCacheService.cacheMessage(conversationId, result);
        resolveOptimisticUpdate(tempId, result);
      }

      return result;
    } catch (error) {
      console.error('Failed to send message:', error);
      messageCacheService.removeCachedMessage(conversationId, tempId);
      rejectOptimisticUpdate(tempId, error instanceof Error ? error.message : 'Failed to send message');
      throw error;
    }
  }, [conversationId, addOptimisticUpdate, resolveOptimisticUpdate, rejectOptimisticUpdate]);

  return {
    optimisticUpdates,
    sendMessageOptimistically,
    mergeWithOptimisticUpdates,
  };
};
