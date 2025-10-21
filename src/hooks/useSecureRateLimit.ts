
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { logSecureSecurityEvent } from '@/services/secureSecurityService';

interface SecureRateLimitConfig {
  maxAttempts?: number;
  windowMinutes?: number;
  resource: string;
}

export const useSecureRateLimit = ({ 
  maxAttempts = 10, 
  windowMinutes = 30, 
  resource 
}: SecureRateLimitConfig) => {
  const { user } = useAuth();
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(maxAttempts);

  const checkLimit = useCallback(async (): Promise<boolean> => {
    if (!user) {
      await logSecureSecurityEvent({
        action: 'rate_limit_check_unauthorized',
        resource_type: 'rate_limiting',
        success: false,
        error_message: 'No authenticated user'
      });
      return false;
    }

    try {
      // Use the secure RPC function
      const { data: allowed, error } = await supabase.rpc('check_rate_limit', {
        p_resource: resource,
        p_max_attempts: maxAttempts,
        p_window_minutes: windowMinutes
      });

      if (error) {
        console.error('Rate limit check failed:', error);
        await logSecureSecurityEvent({
          action: 'rate_limit_check_failed',
          resource_type: 'rate_limiting',
          success: false,
          error_message: error.message,
          metadata: { resource, max_attempts: maxAttempts }
        });
        return true; // Fail open for availability
      }

      if (!allowed) {
        setIsBlocked(true);
        setRemainingAttempts(0);
        
        await logSecureSecurityEvent({
          action: 'rate_limit_exceeded',
          resource_type: 'rate_limiting',
          success: false,
          metadata: { 
            resource, 
            max_attempts: maxAttempts, 
            window_minutes: windowMinutes 
          }
        });
      } else {
        // Reset blocking state if limit check passes
        setIsBlocked(false);
      }

      return allowed;
    } catch (error) {
      console.error('Rate limit check error:', error);
      await logSecureSecurityEvent({
        action: 'rate_limit_check_error',
        resource_type: 'rate_limiting',
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
      return true; // Fail open
    }
  }, [user, resource, maxAttempts, windowMinutes]);

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
