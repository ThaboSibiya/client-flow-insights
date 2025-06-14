
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
 * Send a notification for new messages
 */
export const sendNotification = async (notificationData: NotificationData) => {
  try {
    // Get notification preferences
    const { data: preferences } = await supabase.functions.invoke('notification-helpers', {
      body: { action: 'get', userId: notificationData.recipientId }
    });

    if (!preferences || preferences.notification_frequency === 'never') {
      return;
    }

    // Send desktop notification if enabled and supported
    if (preferences.desktop_notifications && 'Notification' in window) {
      await sendDesktopNotification(notificationData);
    }

    // Send email notification via edge function if enabled
    if (preferences.email_notifications) {
      await sendEmailNotification(notificationData);
    }

    // Show toast notification
    toast({
      title: `New message from ${notificationData.senderName}`,
      description: notificationData.content.substring(0, 100) + '...',
    });

    console.log('Notification sent successfully');
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

const sendDesktopNotification = async (notificationData: NotificationData) => {
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
};

const sendEmailNotification = async (notificationData: NotificationData) => {
  try {
    const { error } = await supabase.functions.invoke('send-notification-email', {
      body: {
        recipientId: notificationData.recipientId,
        senderName: notificationData.senderName,
        content: notificationData.content,
        conversationId: notificationData.conversationId,
        type: notificationData.type,
      },
    });

    if (error) {
      console.error('Error sending email notification:', error);
    }
  } catch (error) {
    console.error('Error invoking email notification function:', error);
  }
};

/**
 * Get notification preferences for a user
 */
export const getNotificationPreferences = async (userId: string): Promise<NotificationPreferences | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('notification-helpers', {
      body: { action: 'get', userId }
    });

    if (error) {
      throw error;
    }

    return data || null;
  } catch (error) {
    console.error('Error getting notification preferences:', error);
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
