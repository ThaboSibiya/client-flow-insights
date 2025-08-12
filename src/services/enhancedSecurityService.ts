
import { supabase } from '@/integrations/supabase/client';
import { sanitizeInput, logSecurityEvent } from '@/utils/securityUtils';

export interface SecurityAlert {
  id: string;
  type: 'suspicious_login' | 'data_breach' | 'privilege_escalation' | 'mass_export';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  userId?: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface SecurityMetrics {
  totalSecurityEvents: number;
  criticalAlerts: number;
  suspiciousLogins: number;
  dataExports: number;
  privilegeChanges: number;
}

interface ValidationRule {
  field: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean';
  maxLength?: number;
  minLength?: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

class EnhancedSecurityService {
  // Validate form data against rules
  validateFormData(data: Record<string, any>, rules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];
    
    for (const rule of rules) {
      const value = data[rule.field];
      
      if (rule.required && (!value || value === '')) {
        errors.push(`${rule.field} is required`);
        continue;
      }
      
      if (value && rule.type === 'string') {
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(`${rule.field} exceeds maximum length of ${rule.maxLength}`);
        }
        if (rule.minLength && value.length < rule.minLength) {
          errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Validate template field structure
  validateTemplateField(field: any): ValidationResult {
    const errors: string[] = [];
    
    if (!field.field_name || typeof field.field_name !== 'string') {
      errors.push('Field name is required and must be a string');
    }
    
    if (!field.field_type || !['text', 'number', 'email', 'phone', 'textarea', 'select'].includes(field.field_type)) {
      errors.push('Valid field type is required');
    }
    
    if (field.field_name && field.field_name.length > 100) {
      errors.push('Field name must be less than 100 characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Sanitize form data recursively
  sanitizeFormData(data: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeInput(value, 1000);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'object' ? this.sanitizeFormData(item) : 
          typeof item === 'string' ? sanitizeInput(item, 1000) : item
        );
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeFormData(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  // Monitor for suspicious activities
  async monitorSuspiciousActivity(userId: string, action: string, metadata: Record<string, any> = {}) {
    try {
      // Log the security event
      await supabase
        .from('security_events')
        .insert({
          user_id: userId,
          event_type: action,
          resource_type: 'security_monitoring',
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
            severity: this.calculateSeverity(action, metadata)
          }
        });

      // Check for patterns that might indicate suspicious behavior
      await this.checkForSuspiciousPatterns(userId, action);
    } catch (error) {
      console.error('Failed to monitor suspicious activity:', error);
    }
  }

  // Calculate severity based on action and context
  private calculateSeverity(action: string, metadata: Record<string, any>): string {
    const highRiskActions = ['mass_data_export', 'privilege_escalation', 'failed_login_multiple'];
    const criticalActions = ['data_breach_attempt', 'unauthorized_access'];

    if (criticalActions.includes(action)) return 'critical';
    if (highRiskActions.includes(action)) return 'high';
    if (metadata.failedAttempts > 5) return 'medium';
    return 'low';
  }

  // Check for suspicious patterns
  private async checkForSuspiciousPatterns(userId: string, action: string) {
    try {
      // Check for multiple failed login attempts
      if (action === 'failed_login') {
        const { data, error } = await supabase
          .from('security_events')
          .select('*')
          .eq('user_id', userId)
          .eq('event_type', 'failed_login')
          .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString()); // Last 15 minutes

        if (error) throw error;

        if (data && data.length >= 5) {
          await this.createSecurityAlert({
            type: 'suspicious_login',
            severity: 'high',
            message: `Multiple failed login attempts detected for user ${userId}`,
            userId,
            metadata: { failedAttempts: data.length }
          });
        }
      }

      // Check for mass data exports
      if (action === 'data_export') {
        const { data, error } = await supabase
          .from('security_events')
          .select('*')
          .eq('user_id', userId)
          .eq('event_type', 'data_export')
          .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()); // Last hour

        if (error) throw error;

        if (data && data.length >= 10) {
          await this.createSecurityAlert({
            type: 'mass_export',
            severity: 'critical',
            message: `Mass data export detected for user ${userId}`,
            userId,
            metadata: { exportCount: data.length }
          });
        }
      }
    } catch (error) {
      console.error('Failed to check suspicious patterns:', error);
    }
  }

  // Create security alert
  private async createSecurityAlert(alert: Omit<SecurityAlert, 'id' | 'createdAt'>) {
    try {
      await supabase
        .from('security_events')
        .insert({
          user_id: alert.userId || null,
          event_type: 'security_alert',
          resource_type: alert.type,
          metadata: {
            severity: alert.severity,
            message: alert.message,
            alertMetadata: alert.metadata,
            timestamp: new Date().toISOString()
          }
        });

      // Log to browser console for immediate visibility
      console.warn('Security Alert:', alert);
      logSecurityEvent('security_alert_created', alert);
    } catch (error) {
      console.error('Failed to create security alert:', error);
    }
  }

  // Validate customer access permissions
  async validateCustomerAccess(userId: string, customerId: string): Promise<boolean> {
    try {
      // Check if customer belongs to user
      const { data, error } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', userId)
        .eq('id', customerId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw error;
      }

      const hasAccess = !!data;

      // Log access attempt
      await this.monitorSuspiciousActivity(userId, 'customer_access_check', {
        customerId,
        hasAccess,
        result: hasAccess ? 'granted' : 'denied'
      });

      return hasAccess;
    } catch (error) {
      console.error('Failed to validate customer access:', error);
      return false;
    }
  }

  // Get security metrics
  async getSecurityMetrics(userId: string): Promise<SecurityMetrics> {
    try {
      const [totalEvents, criticalAlerts, suspiciousLogins, dataExports, privilegeChanges] = await Promise.all([
        this.getEventCount(userId, null),
        this.getEventCount(userId, 'security_alert'),
        this.getEventCount(userId, 'failed_login'),
        this.getEventCount(userId, 'data_export'),
        this.getEventCount(userId, 'privilege_change')
      ]);

      return {
        totalSecurityEvents: totalEvents,
        criticalAlerts,
        suspiciousLogins,
        dataExports,
        privilegeChanges
      };
    } catch (error) {
      console.error('Failed to get security metrics:', error);
      return {
        totalSecurityEvents: 0,
        criticalAlerts: 0,
        suspiciousLogins: 0,
        dataExports: 0,
        privilegeChanges: 0
      };
    }
  }

  private async getEventCount(userId: string, eventType: string | null): Promise<number> {
    try {
      let query = supabase
        .from('security_events')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (eventType) {
        query = query.eq('event_type', eventType);
      }

      const { count, error } = await query;

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error(`Failed to get event count for ${eventType}:`, error);
      return 0;
    }
  }

  // Sanitize and validate input data
  validateAndSanitizeInput(input: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(input)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeInput(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.validateAndSanitizeInput(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}

export const enhancedSecurityService = new EnhancedSecurityService();
