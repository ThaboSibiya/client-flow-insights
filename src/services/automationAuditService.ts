import { supabase } from '@/integrations/supabase/client';

export interface AutomationAuditLog {
  id: string;
  user_id: string;
  automation_id: string;
  action: 'created' | 'updated' | 'deleted' | 'executed' | 'failed';
  details: Record<string, any>;
  timestamp: string;
  ip_address?: string;
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

      const auditLog: Omit<AutomationAuditLog, 'id'> = {
        user_id: user.id,
        automation_id: automationId,
        action,
        details,
        timestamp: new Date().toISOString(),
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent
      };

      console.log('Audit Log:', auditLog);

      // In a real implementation, this would be stored in a database
      // For now, we'll log it and could send to an audit service
      await this.storeAuditLog(auditLog);
    } catch (error) {
      console.error('Failed to log automation action:', error);
    }
  }

  private async storeAuditLog(auditLog: Omit<AutomationAuditLog, 'id'>): Promise<void> {
    // This would typically insert into an audit_logs table
    // For now, we'll store in localStorage for demo purposes
    const existingLogs = JSON.parse(localStorage.getItem('automation_audit_logs') || '[]');
    const newLog = { ...auditLog, id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` };
    existingLogs.push(newLog);
    
    // Keep only last 1000 logs to prevent storage issues
    if (existingLogs.length > 1000) {
      existingLogs.splice(0, existingLogs.length - 1000);
    }
    
    localStorage.setItem('automation_audit_logs', JSON.stringify(existingLogs));
  }

  private async getClientIP(): Promise<string | undefined> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return undefined;
    }
  }

  async getAuditLogs(automationId?: string): Promise<AutomationAuditLog[]> {
    try {
      const logs = JSON.parse(localStorage.getItem('automation_audit_logs') || '[]');
      
      if (automationId) {
        return logs.filter((log: AutomationAuditLog) => log.automation_id === automationId);
      }
      
      return logs.sort((a: AutomationAuditLog, b: AutomationAuditLog) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
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
