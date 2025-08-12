
import { useState, useCallback } from 'react';
import { checkRateLimit } from '@/utils/securityUtils';
import { useAuth } from '@/context/AuthContext';

interface RateLimitConfig {
  maxAttempts?: number;
  windowMs?: number;
  resource: string;
}

export const useRateLimit = ({ maxAttempts = 5, windowMs = 60000, resource }: RateLimitConfig) => {
  const { user } = useAuth();
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(maxAttempts);

  const checkLimit = useCallback(async (): Promise<boolean> => {
    const identifier = user?.id || 'anonymous';
    const allowed = await checkRateLimit(identifier, resource, maxAttempts, windowMs);
    
    if (!allowed) {
      setIsBlocked(true);
      setRemainingAttempts(0);
      return false;
    }
    
    // Update remaining attempts (rough estimate)
    const key = `rate_limit_${identifier}_${resource}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const data = JSON.parse(stored);
      setRemainingAttempts(Math.max(0, maxAttempts - data.count));
    }
    
    return true;
  }, [user?.id, resource, maxAttempts, windowMs]);

  const reset = useCallback(() => {
    setIsBlocked(false);
    setRemainingAttempts(maxAttempts);
  }, [maxAttempts]);

  return {
    checkLimit,
    isBlocked,
    remainingAttempts,
    reset
  };
};
