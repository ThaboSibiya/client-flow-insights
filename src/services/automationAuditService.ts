import { supabase } from '@/integrations/supabase/client';

export interface AutomationAuditLog {
  id: string;
  user_id: string;
  automation_id: string;
  action: 'created' | 'updated' | 'deleted' | 'executed' | 'failed';
  details: Record<string, any>;
  timestamp: string;
  user_agent?: string;
}

class AutomationAuditService {
  async logAutomationAction(
    automationId: string,
    action: AutomationAuditLog['action'],
    details: Record<string, any> = {}
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Log to server-side security_audit_logs table
      await supabase.rpc('log_security_event', {
        p_user_id: user.id,
        p_action: `automation_${action}`,
        p_resource_type: 'automation',
        p_resource_id: automationId,
        p_success: action !== 'failed',
        p_metadata: {
          ...details,
          action,
          timestamp: new Date().toISOString(),
        },
        p_user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.error('Failed to log automation action:', error);
    }
  }

  async getAuditLogs(automationId?: string): Promise<AutomationAuditLog[]> {
    try {
      let query = supabase
        .from('security_audit_logs')
        .select('id, user_id, action, resource_type, resource_id, success, error_message, metadata, timestamp')
        .eq('resource_type', 'automation')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (automationId) {
        query = query.eq('resource_id', automationId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((log: any) => ({
        id: log.id,
        user_id: log.user_id,
        automation_id: log.resource_id || '',
        action: (log.metadata?.action || log.action?.replace('automation_', '')) as AutomationAuditLog['action'],
        details: log.metadata || {},
        timestamp: log.created_at,
        user_agent: log.user_agent,
      }));
    } catch (error) {
      console.error('Failed to retrieve audit logs:', error);
      return [];
    }
  }

  async exportAuditLogs(startDate?: Date, endDate?: Date): Promise<string> {
    const logs = await this.getAuditLogs();
    
    let filteredLogs = logs;
    if (startDate || endDate) {
      filteredLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        if (startDate && logDate < startDate) return false;
        if (endDate && logDate > endDate) return false;
        return true;
      });
    }

    return JSON.stringify(filteredLogs, null, 2);
  }
}

export const automationAuditService = new AutomationAuditService();
