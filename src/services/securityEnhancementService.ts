/**
 * Security Enhancement Service
 * Provides additional security utilities and monitoring
 */

import { supabase } from '@/integrations/supabase/client';

export const securityEnhancementService = {
  /**
   * Log employee role changes with detailed metadata
   */
  logRoleChange: async (
    employeeId: string,
    oldRole: string,
    newRole: string,
    reason?: string
  ) => {
    try {
      await supabase.from('security_audit_logs').insert({
        action: 'employee_role_changed',
        resource_type: 'employee',
        resource_id: employeeId,
        success: true,
        metadata: {
          old_role: oldRole,
          new_role: newRole,
          reason,
          severity: newRole === 'admin' ? 'high' : 'medium',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to log role change:', error);
    }
  },

  /**
   * Check for suspicious role escalation patterns
   */
  detectSuspiciousRoleChanges: async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('security_audit_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('action', 'employee_role_changed')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Flag if more than 3 role changes in 24 hours
      return (data?.length || 0) > 3;
    } catch (error) {
      console.error('Failed to detect suspicious role changes:', error);
      return false;
    }
  },

  /**
   * Get role change audit history for an employee
   */
  getRoleChangeHistory: async (employeeId: string) => {
    try {
      const { data, error } = await supabase
        .from('security_audit_logs')
        .select('*')
        .eq('resource_type', 'employee')
        .eq('resource_id', employeeId)
        .eq('action', 'employee_role_changed')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch role change history:', error);
      return [];
    }
  }
};
