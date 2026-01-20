import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface UserNotification {
  id: string;
  type: 'project_assignment' | 'task_due' | 'mention' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  link?: string;
}

export const useUserNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      // For now, generate sample notifications based on user activity
      // This can be replaced with actual database queries when notifications table exists
      const sampleNotifications: UserNotification[] = [
        {
          id: '1',
          type: 'project_assignment',
          title: 'New Project Assigned',
          message: 'You have been assigned to "Website Redesign" project',
          read: false,
          created_at: new Date().toISOString(),
          link: '/projects'
        },
        {
          id: '2',
          type: 'task_due',
          title: 'Task Due Soon',
          message: 'Task "Complete wireframes" is due tomorrow',
          read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          link: '/projects'
        },
        {
          id: '3',
          type: 'system',
          title: 'Welcome to Quikle!',
          message: 'Your workspace is ready. Start by exploring the dashboard.',
          read: true,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          link: '/dashboard'
        }
      ];

      setNotifications(sampleNotifications);
      setUnreadCount(sampleNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotification = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearNotification,
    refetch: fetchNotifications
  };
};
