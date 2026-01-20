import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface NotificationPreferences {
  id?: string;
  email_notifications: boolean;
  push_notifications: boolean;
  desktop_notifications: boolean;
  sound_notifications: boolean;
  notification_frequency: 'immediate' | 'hourly' | 'daily' | 'never';
  customer_notifications: boolean;
  ticket_notifications: boolean;
  project_notifications: boolean;
  task_notifications: boolean;
  system_notifications: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  email_notifications: true,
  push_notifications: true,
  desktop_notifications: true,
  sound_notifications: true,
  notification_frequency: 'immediate',
  customer_notifications: true,
  ticket_notifications: true,
  project_notifications: true,
  task_notifications: true,
  system_notifications: true,
};

export const useNotificationPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPreferences = useCallback(async () => {
    if (!user) {
      setPreferences(DEFAULT_PREFERENCES);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences({
          id: data.id,
          email_notifications: data.email_notifications ?? true,
          push_notifications: data.push_notifications ?? true,
          desktop_notifications: data.desktop_notifications ?? true,
          sound_notifications: data.sound_notifications ?? true,
          notification_frequency: (data.notification_frequency as NotificationPreferences['notification_frequency']) ?? 'immediate',
          customer_notifications: (data as any).customer_notifications ?? true,
          ticket_notifications: (data as any).ticket_notifications ?? true,
          project_notifications: (data as any).project_notifications ?? true,
          task_notifications: (data as any).task_notifications ?? true,
          system_notifications: (data as any).system_notifications ?? true,
        });
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
    if (!user) return false;

    setSaving(true);
    const newPreferences = { ...preferences, ...updates };
    
    // Optimistic update
    setPreferences(newPreferences);

    try {
      const { id, ...prefsWithoutId } = newPreferences;
      
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          ...prefsWithoutId,
          user_id: user.id,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      toast({
        title: 'Preferences saved',
        description: 'Your notification preferences have been updated.',
      });

      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      // Revert on error
      fetchPreferences();
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [user, preferences, fetchPreferences]);

  const requestDesktopPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Not supported',
        description: 'Desktop notifications are not supported in this browser.',
        variant: 'destructive',
      });
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      toast({
        title: 'Permission denied',
        description: 'Please enable notifications in your browser settings.',
        variant: 'destructive',
      });
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }, []);

  return {
    preferences,
    loading,
    saving,
    updatePreferences,
    requestDesktopPermission,
    refetch: fetchPreferences,
  };
};
