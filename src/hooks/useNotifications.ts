import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getNotificationPreferences,
  updateNotificationSettings,
  sendNotification,
  NotificationPreferences,
  NotificationData,
} from '@/services/notificationService';

// Simple in-memory cache for preferences
const preferencesCache = new Map<string, { data: NotificationPreferences; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useNotifications = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);

  const getCachedPreferences = useCallback((userId: string) => {
    const cached = preferencesCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, []);

  const setCachedPreferences = useCallback((userId: string, data: NotificationPreferences) => {
    preferencesCache.set(userId, { data, timestamp: Date.now() });
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadPreferences();
    }
  }, [user?.id]);

  const loadPreferences = useCallback(async () => {
    if (!user?.id) return;

    // Check cache first
    const cached = getCachedPreferences(user.id);
    if (cached) {
      setPreferences(cached);
      return;
    }

    // Set default preferences immediately to avoid blocking UI
    const defaultPrefs: NotificationPreferences = {
      email_notifications: true,
      push_notifications: true,
      desktop_notifications: true,
      sound_notifications: true,
      notification_frequency: 'immediate',
    };
    setPreferences(defaultPrefs);

    // Load actual preferences in background
    setLoading(true);
    try {
      const prefs = await Promise.race([
        getNotificationPreferences(user.id),
        new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        )
      ]);
      
      if (prefs) {
        setPreferences(prefs);
        setCachedPreferences(user.id, prefs);
      }
    } catch (error) {
      console.warn('Failed to load notification preferences, using defaults:', error);
      // Keep default preferences if loading fails
    } finally {
      setLoading(false);
    }
  }, [user?.id, getCachedPreferences, setCachedPreferences]);

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    if (!user?.id) return false;

    // Optimistic update
    const updatedPrefs = preferences ? { ...preferences, ...newPreferences } : null;
    if (updatedPrefs) {
      setPreferences(updatedPrefs);
      setCachedPreferences(user.id, updatedPrefs);
    }

    const success = await updateNotificationSettings(user.id, newPreferences);
    if (!success && updatedPrefs) {
      // Revert on failure
      loadPreferences();
    }
    return success;
  };

  const sendMessageNotification = async (notificationData: NotificationData) => {
    // Send notifications asynchronously without blocking
    sendNotification(notificationData).catch(error => {
      console.warn('Failed to send notification:', error);
    });
  };

  return {
    preferences,
    loading,
    updatePreferences,
    sendMessageNotification,
    refreshPreferences: loadPreferences,
  };
};
