import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuditLogEntry {
  action: string;
  table_name: string;
  record_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
}

export const useSecureAuditLog = () => {
  const logAction = useCallback(async (entry: AuditLogEntry): Promise<void> => {
    try {
      const { error } = await supabase.functions.invoke('secure-audit-logs', {
        body: {
          ...entry,
          ip_address: await getClientIP()
        }
      });

      if (error) {
        console.error('Failed to log audit entry:', error);
      }
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }, []);

  const getAuditLogs = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('secure-audit-logs', {
        method: 'GET'
      });

      if (error) {
        console.error('Failed to fetch audit logs:', error);
        return [];
      }

      return data?.logs || [];
    } catch (error) {
      console.error('Audit logs fetch error:', error);
      return [];
    }
  }, []);

  return {
    logAction,
    getAuditLogs
  };
};

// Helper function to get client IP (best effort)
const getClientIP = async (): Promise<string | undefined> => {
  try {
    // This is a simple approach - in production you might want to use a more reliable service
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return undefined;
  }
};