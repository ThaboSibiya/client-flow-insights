
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  desktop_notifications: boolean;
  sound_notifications: boolean;
  notification_frequency: 'immediate' | 'hourly' | 'daily' | 'never';
}

export interface NotificationData {
  conversationId: string;
  messageId: string;
  senderName: string;
  content: string;
  type: 'new_message' | 'mention' | 'assignment';
  recipientId: string;
}

/**
 * Send a notification for new messages (optimized for performance)
 */
export const sendNotification = async (notificationData: NotificationData) => {
  try {
    // Get notification preferences with timeout
    const { data: preferences } = await Promise.race([
      supabase.functions.invoke('notification-helpers', {
        body: { action: 'get', userId: notificationData.recipientId }
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 2000)
      )
    ]) as any;

    if (!preferences || preferences.notification_frequency === 'never') {
      return;
    }

    // Send notifications in parallel for better performance
    const notificationPromises = [];

    // Desktop notification
    if (preferences.desktop_notifications && 'Notification' in window) {
      notificationPromises.push(sendDesktopNotification(notificationData));
    }

    // Email notification
    if (preferences.email_notifications) {
      notificationPromises.push(sendEmailNotification(notificationData));
    }

    // Toast notification (immediate)
    toast({
      title: `New message from ${notificationData.senderName}`,
      description: notificationData.content.substring(0, 100) + '...',
    });

    // Execute all notifications in parallel
    await Promise.allSettled(notificationPromises);

    console.log('Notifications sent successfully');
  } catch (error) {
    console.warn('Error sending notification:', error);
    // Still show toast even if other notifications fail
    toast({
      title: `New message from ${notificationData.senderName}`,
      description: notificationData.content.substring(0, 100) + '...',
    });
  }
};

const sendDesktopNotification = async (notificationData: NotificationData) => {
  try {
    if (Notification.permission === 'granted') {
      new Notification(`New message from ${notificationData.senderName}`, {
        body: notificationData.content.substring(0, 100) + '...',
        icon: '/favicon.ico',
        tag: notificationData.conversationId,
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(`New message from ${notificationData.senderName}`, {
          body: notificationData.content.substring(0, 100) + '...',
          icon: '/favicon.ico',
          tag: notificationData.conversationId,
        });
      }
    }
  } catch (error) {
    console.warn('Desktop notification failed:', error);
  }
};

const sendEmailNotification = async (notificationData: NotificationData) => {
  try {
    const { error } = await Promise.race([
      supabase.functions.invoke('send-notification-email', {
        body: {
          recipientId: notificationData.recipientId,
          senderName: notificationData.senderName,
          content: notificationData.content,
          conversationId: notificationData.conversationId,
          type: notificationData.type,
        },
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email timeout')), 5000)
      )
    ]) as any;

    if (error) {
      console.warn('Email notification failed:', error);
    }
  } catch (error) {
    console.warn('Email notification timeout or error:', error);
  }
};

/**
 * Get notification preferences (optimized with timeout)
 */
export const getNotificationPreferences = async (userId: string): Promise<NotificationPreferences | null> => {
  try {
    const { data, error } = await Promise.race([
      supabase.functions.invoke('notification-helpers', {
        body: { action: 'get', userId }
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      )
    ]) as any;

    if (error) {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.warn('Error getting notification preferences:', error);
    return null;
  }
};

/**
 * Update notification preferences for a user
 */
export const updateNotificationSettings = async (
  userId: string,
  preferences: Partial<NotificationPreferences>
): Promise<boolean> => {
  try {
    const { error } = await supabase.functions.invoke('notification-helpers', {
      body: { 
        action: 'upsert', 
        userId, 
        preferences: {
          ...preferences,
          updated_at: new Date().toISOString(),
        }
      }
    });

    if (error) throw error;

    toast({
      title: 'Settings updated',
      description: 'Your notification preferences have been saved.',
    });

    return true;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    toast({
      title: 'Error',
      description: 'Failed to update notification settings.',
      variant: 'destructive',
    });
    return false;
  }
};
