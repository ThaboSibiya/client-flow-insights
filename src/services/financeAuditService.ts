import { supabase } from '@/integrations/supabase/client';

export type FinanceAction = 'view' | 'create' | 'update' | 'delete' | 'export' | 'payment' | 'statement_generated';
export type FinanceResource = 'invoice' | 'payment' | 'note' | 'transaction' | 'summary' | 'statement' | 'account_flag';

interface LogFinanceActionParams {
  actionType: FinanceAction;
  resourceType: FinanceResource;
  resourceId?: string;
  customerId?: string;
  oldValues?: any;
  newValues?: any;
  metadata?: Record<string, any>;
}

/**
 * Service for logging finance-related actions for audit and compliance
 */
class FinanceAuditService {
  /**
   * Log a finance action to the audit trail
   */
  async logAction({
    actionType,
    resourceType,
    resourceId,
    customerId,
    oldValues,
    newValues,
    metadata = {}
  }: LogFinanceActionParams): Promise<string | null> {
    try {
      // Add context to metadata
      const enrichedMetadata = {
        ...metadata,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: this.getSessionId()
      };

      const { data, error } = await supabase.rpc('log_finance_action', {
        p_action_type: actionType,
        p_resource_type: resourceType,
        p_resource_id: resourceId || null,
        p_customer_id: customerId || null,
        p_old_values: oldValues ? JSON.stringify(oldValues) : null,
        p_new_values: newValues ? JSON.stringify(newValues) : null,
        p_metadata: enrichedMetadata
      });

      if (error) {
        console.error('Failed to log finance action:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error logging finance action:', error);
      return null;
    }
  }

  /**
   * Get or create a session ID for tracking user sessions
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('finance_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      sessionStorage.setItem('finance_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Helper methods for specific actions
   */
  
  async logView(resourceType: FinanceResource, resourceId: string, customerId?: string) {
    return this.logAction({
      actionType: 'view',
      resourceType,
      resourceId,
      customerId
    });
  }

  async logCreate(resourceType: FinanceResource, newValues: any, customerId?: string) {
    return this.logAction({
      actionType: 'create',
      resourceType,
      newValues,
      customerId,
      metadata: { created: true }
    });
  }

  async logUpdate(resourceType: FinanceResource, resourceId: string, oldValues: any, newValues: any, customerId?: string) {
    return this.logAction({
      actionType: 'update',
      resourceType,
      resourceId,
      oldValues,
      newValues,
      customerId
    });
  }

  async logDelete(resourceType: FinanceResource, resourceId: string, oldValues: any, customerId?: string) {
    return this.logAction({
      actionType: 'delete',
      resourceType,
      resourceId,
      oldValues,
      customerId
    });
  }

  async logPayment(paymentData: any, customerId: string) {
    return this.logAction({
      actionType: 'payment',
      resourceType: 'payment',
      newValues: paymentData,
      customerId,
      metadata: { amount: paymentData.amount }
    });
  }

  async logStatementGenerated(customerId: string, metadata?: Record<string, any>) {
    return this.logAction({
      actionType: 'statement_generated',
      resourceType: 'statement',
      customerId,
      metadata
    });
  }

  async logExport(resourceType: FinanceResource, customerId?: string, metadata?: Record<string, any>) {
    return this.logAction({
      actionType: 'export',
      resourceType,
      customerId,
      metadata: { ...metadata, exported: true }
    });
  }

  /**
   * Fetch audit logs (only for finance admins)
   */
  async getAuditLogs(filters?: {
    customerId?: string;
    actionType?: FinanceAction;
    resourceType?: FinanceResource;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }) {
    try {
      let query = supabase
        .from('finance_audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }
      if (filters?.actionType) {
        query = query.eq('action_type', filters.actionType);
      }
      if (filters?.resourceType) {
        query = query.eq('resource_type', filters.resourceType);
      }
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }
}

export const financeAuditService = new FinanceAuditService();
