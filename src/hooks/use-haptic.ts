import { useCallback } from 'react';

type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error';

export function useHaptic() {
  const trigger = useCallback((style: HapticStyle = 'light') => {
    // Check if Vibration API is available
    if (!('vibrate' in navigator)) return;

    const patterns: Record<HapticStyle, number | number[]> = {
      light: 10,
      medium: 20,
      heavy: 30,
      selection: 5,
      success: [10, 50, 10],
      warning: [20, 100, 20],
      error: [30, 100, 30, 100, 30],
    };

    try {
      navigator.vibrate(patterns[style]);
    } catch {
      // Vibration not supported or blocked
    }
  }, []);

  const impact = useCallback((style: 'light' | 'medium' | 'heavy' = 'medium') => {
    trigger(style);
  }, [trigger]);

  const notification = useCallback((type: 'success' | 'warning' | 'error' = 'success') => {
    trigger(type);
  }, [trigger]);

  const selection = useCallback(() => {
    trigger('selection');
  }, [trigger]);

  return { trigger, impact, notification, selection };
}
