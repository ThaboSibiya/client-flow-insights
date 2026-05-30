import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useActiveWorkspaceId } from '@/hooks/useActiveWorkspaceId';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface RealtimeNotification {
  id: string;
  type: 'project_assignment' | 'task_due' | 'mention' | 'system' | 'ticket' | 'customer';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  link?: string;
  metadata?: Record<string, any>;
}

interface DatabaseNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  workspace_id: string | null;
}

export const useRealtimeNotifications = (enabled = true) => {
  const { user } = useAuth();
  const workspaceId = useActiveWorkspaceId();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const mapNotification = (row: DatabaseNotification): RealtimeNotification => ({
    id: row.id,
    type: row.type as RealtimeNotification['type'],
    title: row.title,
    message: row.message,
    read: row.read,
    created_at: row.created_at,
    link: row.link || undefined,
    metadata: row.metadata || undefined,
  });

  const fetchNotifications = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('user_notifications')
        .select('id, user_id, type, title, message, read, link, metadata, created_at, workspace_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      // Filter by workspace if available (show global + workspace-scoped)
      if (workspaceId) {
        query = query.or(`workspace_id.eq.${workspaceId},workspace_id.is.null`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mapped = (data || []).map(mapNotification);
      setNotifications(mapped);
      setUnreadCount(mapped.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [enabled, user, workspaceId]);

  // Subscribe to real-time changes
  useEffect(() => {
    if (!enabled) return;
    if (!user) return;

    fetchNotifications();

    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: RealtimePostgresChangesPayload<DatabaseNotification>) => {
          if (payload.eventType === 'INSERT') {
            const newNotification = mapNotification(payload.new as DatabaseNotification);
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
          } else if (payload.eventType === 'UPDATE') {
            const updated = mapNotification(payload.new as DatabaseNotification);
            let unreadDelta = 0;
            setNotifications(prev => prev.map(n => {
              if (n.id !== updated.id) return n;
              if (n.read !== updated.read) unreadDelta = updated.read ? -1 : 1;
              return updated;
            }));
            if (unreadDelta !== 0) {
              setUnreadCount(prev => Math.max(0, prev + unreadDelta));
            }
          } else if (payload.eventType === 'DELETE') {
            const oldData = payload.old as DatabaseNotification;
            setNotifications(prev => prev.filter(n => n.id !== oldData.id));
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, user, fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    // Optimistic update
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert on error
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all as read:', error);
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  const clearNotification = useCallback(async (notificationId: string) => {
    if (!user) return;

    const notification = notifications.find(n => n.id === notificationId);
    
    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    try {
      const { error } = await supabase
        .from('user_notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error clearing notification:', error);
      fetchNotifications();
    }
  }, [user, notifications, fetchNotifications]);

  const createNotification = useCallback(async (
    notification: Omit<RealtimeNotification, 'id' | 'created_at' | 'read'>
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_notifications')
        .insert({
          user_id: user.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          link: notification.link || null,
          metadata: notification.metadata || {},
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearNotification,
    createNotification,
    refetch: fetchNotifications,
  };
};
