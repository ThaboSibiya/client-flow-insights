import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export type OptimisticOperation = 'create' | 'update' | 'delete';

interface OptimisticState<T> {
  items: T[];
  loading: boolean;
  error: string | null;
}

interface OptimisticUpdate<T> {
  operation: OptimisticOperation;
  item: T;
  tempId?: string;
  originalItem?: T;
}

export const useOptimisticCRUD = <T extends { id: string }>(
  initialItems: T[] = [],
  apiService: {
    create: (item: Omit<T, 'id'>) => Promise<T>;
    update: (id: string, item: Partial<T>) => Promise<T>;
    delete: (id: string) => Promise<void>;
  }
) => {
  const [state, setState] = useState<OptimisticState<T>>({
    items: initialItems,
    loading: false,
    error: null,
  });

  const [pendingUpdates, setPendingUpdates] = useState<Map<string, OptimisticUpdate<T>>>(
    new Map()
  );

  // Generate temporary ID for optimistic updates
  const generateTempId = useCallback(() => `temp_${Date.now()}_${Math.random()}`, []);

  // Rollback optimistic update
  const rollbackUpdate = useCallback((updateId: string) => {
    const update = pendingUpdates.get(updateId);
    if (!update) return;

    setState(prev => {
      let newItems = [...prev.items];
      
      switch (update.operation) {
        case 'create':
          newItems = newItems.filter(item => item.id !== update.tempId);
          break;
        case 'update':
          if (update.originalItem) {
            const index = newItems.findIndex(item => item.id === update.item.id);
            if (index !== -1) {
              newItems[index] = update.originalItem;
            }
          }
          break;
        case 'delete':
          if (update.originalItem) {
            newItems.push(update.originalItem);
          }
          break;
      }
      
      return { ...prev, items: newItems };
    });

    setPendingUpdates(prev => {
      const newMap = new Map(prev);
      newMap.delete(updateId);
      return newMap;
    });
  }, [pendingUpdates]);

  // Confirm optimistic update
  const confirmUpdate = useCallback((updateId: string, realItem?: T) => {
    const update = pendingUpdates.get(updateId);
    if (!update) return;

    if (realItem && update.operation === 'create' && update.tempId) {
      setState(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.id === update.tempId ? realItem : item
        )
      }));
    }

    setPendingUpdates(prev => {
      const newMap = new Map(prev);
      newMap.delete(updateId);
      return newMap;
    });
  }, [pendingUpdates]);

  // Optimistic create
  const createItem = useCallback(async (newItem: Omit<T, 'id'>) => {
    const tempId = generateTempId();
    const updateId = generateTempId();
    const optimisticItem = { ...newItem, id: tempId } as T;

    // Optimistic update
    setState(prev => ({
      ...prev,
      items: [...prev.items, optimisticItem],
      loading: true,
      error: null,
    }));

    setPendingUpdates(prev => new Map(prev).set(updateId, {
      operation: 'create',
      item: optimisticItem,
      tempId,
    }));

    try {
      const createdItem = await apiService.create(newItem);
      confirmUpdate(updateId, createdItem);
      
      toast({
        title: "Success",
        description: "Item created successfully",
      });
      
      return createdItem;
    } catch (error) {
      rollbackUpdate(updateId);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create item';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [apiService, generateTempId, confirmUpdate, rollbackUpdate]);

  // Optimistic update
  const updateItem = useCallback(async (id: string, updates: Partial<T>) => {
    const updateId = generateTempId();
    const originalItem = state.items.find(item => item.id === id);
    
    if (!originalItem) {
      throw new Error('Item not found');
    }

    const updatedItem = { ...originalItem, ...updates };

    // Optimistic update
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? updatedItem : item),
      loading: true,
      error: null,
    }));

    setPendingUpdates(prev => new Map(prev).set(updateId, {
      operation: 'update',
      item: updatedItem,
      originalItem,
    }));

    try {
      const serverItem = await apiService.update(id, updates);
      confirmUpdate(updateId, serverItem);
      
      // Update with server response
      setState(prev => ({
        ...prev,
        items: prev.items.map(item => item.id === id ? serverItem : item),
      }));
      
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
      
      return serverItem;
    } catch (error) {
      rollbackUpdate(updateId);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update item';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.items, apiService, generateTempId, confirmUpdate, rollbackUpdate]);

  // Optimistic delete
  const deleteItem = useCallback(async (id: string) => {
    const updateId = generateTempId();
    const originalItem = state.items.find(item => item.id === id);
    
    if (!originalItem) {
      throw new Error('Item not found');
    }

    // Optimistic update
    setState(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
      loading: true,
      error: null,
    }));

    setPendingUpdates(prev => new Map(prev).set(updateId, {
      operation: 'delete',
      item: originalItem,
      originalItem,
    }));

    try {
      await apiService.delete(id);
      confirmUpdate(updateId);
      
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    } catch (error) {
      rollbackUpdate(updateId);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete item';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.items, apiService, generateTempId, confirmUpdate, rollbackUpdate]);

  // Bulk operations with optimistic updates
  const bulkDelete = useCallback(async (ids: string[]) => {
    const updateId = generateTempId();
    const originalItems = state.items.filter(item => ids.includes(item.id));

    // Optimistic update
    setState(prev => ({
      ...prev,
      items: prev.items.filter(item => !ids.includes(item.id)),
      loading: true,
      error: null,
    }));

    try {
      await Promise.all(ids.map(id => apiService.delete(id)));
      
      toast({
        title: "Success",
        description: `${ids.length} items deleted successfully`,
      });
    } catch (error) {
      // Rollback by adding items back
      setState(prev => ({
        ...prev,
        items: [...prev.items, ...originalItems],
      }));
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete items';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.items, apiService, generateTempId]);

  // Set items (for initial load or refresh)
  const setItems = useCallback((items: T[]) => {
    setState(prev => ({ ...prev, items, error: null }));
  }, []);

  // Refresh items
  const refreshItems = useCallback((items: T[]) => {
    setItems(items);
    setPendingUpdates(new Map()); // Clear pending updates
  }, [setItems]);

  return {
    items: state.items,
    loading: state.loading,
    error: state.error,
    pendingUpdates: pendingUpdates.size,
    createItem,
    updateItem,
    deleteItem,
    bulkDelete,
    setItems,
    refreshItems,
  };
};