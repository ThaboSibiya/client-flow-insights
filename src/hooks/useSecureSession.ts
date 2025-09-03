import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logSecureSecurityEvent } from '@/services/secureSecurityService';

interface SecureSessionData {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
  sessionValid: boolean;
}

/**
 * Secure session management hook with comprehensive security logging
 */
export const useSecureSession = () => {
  const [sessionData, setSessionData] = useState<SecureSessionData>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    sessionValid: false
  });

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          await logSecureSecurityEvent({
            action: 'session_check_failed',
            resource_type: 'authentication',
            success: false,
            error_message: error.message
          });
          
          if (mounted) {
            setSessionData({
              isAuthenticated: false,
              user: null,
              isLoading: false,
              sessionValid: false
            });
          }
          return;
        }

        const isValid = session && session.expires_at && session.expires_at > Math.floor(Date.now() / 1000);
        
        if (session && isValid) {
          await logSecureSecurityEvent({
            action: 'session_validated',
            resource_type: 'authentication',
            success: true,
            metadata: { 
              user_id: session.user.id,
              expires_at: session.expires_at
            }
          });
        } else if (session && !isValid) {
          await logSecureSecurityEvent({
            action: 'session_expired',
            resource_type: 'authentication',
            success: false,
            metadata: { 
              user_id: session.user.id,
              expires_at: session.expires_at,
              current_time: Math.floor(Date.now() / 1000)
            }
          });
        }

        if (mounted) {
          setSessionData({
            isAuthenticated: !!session && isValid,
            user: session?.user || null,
            isLoading: false,
            sessionValid: isValid
          });
        }
      } catch (error) {
        await logSecureSecurityEvent({
          action: 'session_check_error',
          resource_type: 'authentication',
          success: false,
          error_message: error instanceof Error ? error.message : 'Unknown error'
        });
        
        if (mounted) {
          setSessionData({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            sessionValid: false
          });
        }
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      await logSecureSecurityEvent({
        action: 'auth_state_changed',
        resource_type: 'authentication',
        success: true,
        metadata: { 
          event,
          user_id: session?.user?.id,
          has_session: !!session
        }
      });

      const isValid = session && session.expires_at && session.expires_at > Math.floor(Date.now() / 1000);
      
      if (mounted) {
        setSessionData({
          isAuthenticated: !!session && isValid,
          user: session?.user || null,
          isLoading: false,
          sessionValid: isValid
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const secureSignOut = async () => {
    try {
      await logSecureSecurityEvent({
        action: 'logout_initiated',
        resource_type: 'authentication',
        success: true,
        metadata: { user_id: sessionData.user?.id }
      });

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        await logSecureSecurityEvent({
          action: 'logout_failed',
          resource_type: 'authentication',
          success: false,
          error_message: error.message
        });
        throw error;
      }

      await logSecureSecurityEvent({
        action: 'logout_successful',
        resource_type: 'authentication',
        success: true
      });

      setSessionData({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        sessionValid: false
      });
    } catch (error) {
      await logSecureSecurityEvent({
        action: 'logout_error',
        resource_type: 'authentication',
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  };

  return {
    ...sessionData,
    secureSignOut
  };
};