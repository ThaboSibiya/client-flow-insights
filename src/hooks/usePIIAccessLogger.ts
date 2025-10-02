import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook for logging PII access for audit and compliance purposes
 */
export const usePIIAccessLogger = () => {
  const { user } = useAuth();

  const logPIIAccess = useCallback(async (
    resourceType: 'customer' | 'employee',
    resourceId: string,
    piiFields: string[],
    action: 'view' | 'edit' | 'export'
  ) => {
    if (!user) return;

    try {
      await supabase.from('security_events').insert({
        user_id: user.id,
        event_type: 'pii_access',
        resource_type: resourceType,
        resource_id: resourceId,
        metadata: {
          pii_fields: piiFields,
          action,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent
        }
      });
    } catch (error) {
      console.error('Failed to log PII access:', error);
    }
  }, [user]);

  return { logPIIAccess };
};
