
import { useState, useCallback } from 'react';

export interface OptimisticUpdate<T> {
  id: string;
  type: 'add' | 'update' | 'delete';
  data: T;
  timestamp: number;
  status: 'pending' | 'resolved' | 'rejected';
  error?: string;
}

export const useOptimisticUpdates = <T>(entityType?: string) => {
  const [optimisticUpdates, setOptimisticUpdates] = useState<OptimisticUpdate<T>[]>([]);

  const addOptimisticUpdate = useCallback((id: string, data: T, type: 'add' | 'update' | 'delete' = 'add') => {
    const update: OptimisticUpdate<T> = {
      id,
      type,
      data,
      timestamp: Date.now(),
      status: 'pending',
    };
    
    setOptimisticUpdates(prev => [...prev, update]);
    return update;
  }, []);

  const resolveOptimisticUpdate = useCallback((id: string, finalData?: T) => {
    setOptimisticUpdates(prev =>
      prev.map(update =>
        update.id === id
          ? { ...update, status: 'resolved' as const, data: finalData || update.data }
          : update
      )
    );
  }, []);

  const rejectOptimisticUpdate = useCallback((id: string, error: string) => {
    setOptimisticUpdates(prev =>
      prev.map(update =>
        update.id === id
          ? { ...update, status: 'rejected' as const, error }
          : update
      )
    );
  }, []);

  const clearOptimisticUpdate = useCallback((id: string) => {
    setOptimisticUpdates(prev => prev.filter(update => update.id !== id));
  }, []);

  const mergeWithOptimisticUpdates = useCallback((
    serverData: T[],
    keyExtractor: (item: T) => string
  ): T[] => {
    const pendingUpdates = optimisticUpdates.filter(update => update.status === 'pending');
    
    let result = [...serverData];
    
    pendingUpdates.forEach(update => {
      if (update.type === 'add') {
        const exists = result.some(item => keyExtractor(item) === update.id);
        if (!exists) {
          result = [...result, update.data];
        }
      } else if (update.type === 'update') {
        result = result.map(item =>
          keyExtractor(item) === update.id ? { ...item, ...update.data } : item
        );
      } else if (update.type === 'delete') {
        result = result.filter(item => keyExtractor(item) !== update.id);
      }
    });
    
    return result;
  }, [optimisticUpdates]);

  // Message-specific method
  const sendMessageOptimistically = useCallback(async (messageData: any, apiCall: () => Promise<any>) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      ...messageData,
      created_at: new Date().toISOString(),
      status: 'sending' as const,
    };
    
    const update = addOptimisticUpdate(tempId, optimisticMessage, 'add');
    
    try {
      const result = await apiCall();
      resolveOptimisticUpdate(tempId, result);
      clearOptimisticUpdate(tempId);
      return result;
    } catch (error) {
      rejectOptimisticUpdate(tempId, error instanceof Error ? error.message : 'Unknown error');
      setTimeout(() => clearOptimisticUpdate(tempId), 5000); // Auto-clear failed messages
      throw error;
    }
  }, [addOptimisticUpdate, resolveOptimisticUpdate, rejectOptimisticUpdate, clearOptimisticUpdate]);

  // Customer-specific methods for CRM context
  const updateCustomerOptimistically = useCallback(async (id: string, updates: Partial<T>, apiCall: () => Promise<void>) => {
    const update = addOptimisticUpdate(id, updates, 'update');
    
    try {
      await apiCall();
      resolveOptimisticUpdate(id);
    } catch (error) {
      rejectOptimisticUpdate(id, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }, [addOptimisticUpdate, resolveOptimisticUpdate, rejectOptimisticUpdate]);

  const deleteCustomerOptimistically = useCallback(async (id: string, apiCall: () => Promise<void>) => {
    const update = addOptimisticUpdate(id, {} as T, 'delete');
    
    try {
      await apiCall();
      resolveOptimisticUpdate(id);
      clearOptimisticUpdate(id);
    } catch (error) {
      rejectOptimisticUpdate(id, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }, [addOptimisticUpdate, resolveOptimisticUpdate, rejectOptimisticUpdate, clearOptimisticUpdate]);

  const addCustomerOptimistically = useCallback(async (customer: T, apiCall: () => Promise<void>) => {
    const tempId = `temp-${Date.now()}`;
    const update = addOptimisticUpdate(tempId, customer, 'add');
    
    try {
      await apiCall();
      resolveOptimisticUpdate(tempId);
      clearOptimisticUpdate(tempId);
    } catch (error) {
      rejectOptimisticUpdate(tempId, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }, [addOptimisticUpdate, resolveOptimisticUpdate, rejectOptimisticUpdate, clearOptimisticUpdate]);

  const updateTicketOptimistically = useCallback(async (id: string, updates: Partial<T>, apiCall: () => Promise<void>) => {
    const update = addOptimisticUpdate(id, updates, 'update');
    
    try {
      await apiCall();
      resolveOptimisticUpdate(id);
    } catch (error) {
      rejectOptimisticUpdate(id, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }, [addOptimisticUpdate, resolveOptimisticUpdate, rejectOptimisticUpdate, clearOptimisticUpdate]);

  return {
    optimisticUpdates,
    addOptimisticUpdate,
    resolveOptimisticUpdate,
    rejectOptimisticUpdate,
    clearOptimisticUpdate,
    mergeWithOptimisticUpdates,
    sendMessageOptimistically,
    updateCustomerOptimistically,
    deleteCustomerOptimistically,
    addCustomerOptimistically,
    updateTicketOptimistically,
  };
};

// Export specialized hook for messages
export const useOptimisticMessages = (conversationId: string) => {
  return useOptimisticUpdates<any>('message');
};
