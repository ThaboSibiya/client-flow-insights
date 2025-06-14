
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getNotificationPreferences,
  updateNotificationSettings,
  sendNotification,
  NotificationPreferences,
  NotificationData,
} from '@/services/notificationService';

export const useNotifications = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadPreferences();
    }
  }, [user?.id]);

  const loadPreferences = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const prefs = await getNotificationPreferences(user.id);
      if (prefs) {
        setPreferences(prefs);
      } else {
        // Set default preferences if none exist
        const defaultPrefs: NotificationPreferences = {
          email_notifications: true,
          push_notifications: true,
          desktop_notifications: true,
          sound_notifications: true,
          notification_frequency: 'immediate',
        };
        setPreferences(defaultPrefs);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    if (!user?.id) return false;

    const success = await updateNotificationSettings(user.id, newPreferences);
    if (success) {
      setPreferences(prev => prev ? { ...prev, ...newPreferences } : null);
    }
    return success;
  };

  const sendMessageNotification = async (notificationData: NotificationData) => {
    await sendNotification(notificationData);
  };

  return {
    preferences,
    loading,
    updatePreferences,
    sendMessageNotification,
    refreshPreferences: loadPreferences,
  };
};
