import { useState, useEffect, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UseSessionTimeoutOptions {
  user: User | null;
  signOut: () => Promise<void>;
  timeoutMinutes?: number;
  warningMinutes?: number;
  onTimeout?: () => void;
  onWarning?: () => void;
}

export const useSessionTimeout = ({
  user,
  signOut,
  timeoutMinutes = 30,
  warningMinutes = 2,
  onTimeout,
  onWarning
}: UseSessionTimeoutOptions) => {
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(timeoutMinutes * 60);
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();
  const countdownRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());
  const lastTimerResetRef = useRef<number>(0);

  const resetTimers = useCallback(() => {
    lastActivityRef.current = Date.now();
    setShowWarning(false);
    setRemainingTime(timeoutMinutes * 60);

    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    if (!user) return;

    // Set warning timer
    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      onWarning?.();
      
      // Start countdown
      countdownRef.current = setInterval(() => {
        const elapsed = Date.now() - lastActivityRef.current;
        const remaining = Math.max(0, (timeoutMinutes * 60 * 1000 - elapsed) / 1000);
        setRemainingTime(Math.floor(remaining));
      }, 1000);
    }, warningTime);

    // Set timeout timer
    timeoutRef.current = setTimeout(async () => {
      // Log session timeout
      await supabase.from('security_events').insert({
        user_id: user.id,
        event_type: 'session_timeout',
        resource_type: 'auth',
        metadata: {
          timeout_minutes: timeoutMinutes,
          last_activity: new Date(lastActivityRef.current).toISOString()
        }
      });

      onTimeout?.();
      await signOut();
    }, timeoutMinutes * 60 * 1000);
  }, [user, timeoutMinutes, warningMinutes, onTimeout, onWarning, signOut]);

  const extendSession = useCallback(async () => {
    if (!user) return;

    try {
      // Refresh the session
      await supabase.auth.refreshSession();
      
      // Log session extension
      await supabase.from('security_events').insert({
        user_id: user.id,
        event_type: 'session_extended',
        resource_type: 'auth',
        metadata: {
          extended_at: new Date().toISOString()
        }
      });

      resetTimers();
    } catch (error) {
      console.error('Failed to extend session:', error);
    }
  }, [user, resetTimers]);

  // Track user activity
  useEffect(() => {
    if (!user) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      if (!showWarning) {
        const now = Date.now();
        if (now - lastTimerResetRef.current < 60_000) return;
        lastTimerResetRef.current = now;
        resetTimers();
      }
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Initialize timers
    resetTimers();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [user, showWarning, resetTimers]);

  return {
    showWarning,
    remainingTime,
    extendSession,
    resetTimers
  };
};
