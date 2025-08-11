
import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  event_type: string;
  user_id: string;
  resource_type: string;
  resource_id?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export const securityMonitoringService = {
  // Log template access patterns for monitoring
  async logTemplateAccess(templateId: string, userId: string, actionType: 'view' | 'create' | 'update' | 'delete') {
    try {
      const event: SecurityEvent = {
        event_type: 'template_access',
        user_id: userId,
        resource_type: 'industry_template',
        resource_id: templateId,
        metadata: {
          action: actionType,
          timestamp: new Date().toISOString(),
        },
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
      };

      console.log('Template access logged:', event);

      // In a production environment, you would send this to a monitoring service
      // For now, we'll store it in local storage for demonstration
      this.storeSecurityEvent(event);
    } catch (error) {
      console.error('Failed to log template access:', error);
    }
  },

  // Log email history operations for audit
  async logEmailHistoryOperation(customerId: string, userId: string, actionType: 'create' | 'view' | 'update' | 'delete') {
    try {
      const event: SecurityEvent = {
        event_type: 'email_history_operation',
        user_id: userId,
        resource_type: 'email_history',
        resource_id: customerId,
        metadata: {
          action: actionType,
          timestamp: new Date().toISOString(),
        },
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
      };

      console.log('Email history operation logged:', event);
      this.storeSecurityEvent(event);
    } catch (error) {
      console.error('Failed to log email history operation:', error);
    }
  },

  // Rate limiting check for template queries
  async checkTemplateRateLimit(userId: string): Promise<boolean> {
    const rateLimitKey = `template_rate_limit_${userId}`;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 100; // Max 100 template requests per minute

    try {
      const stored = localStorage.getItem(rateLimitKey);
      const data = stored ? JSON.parse(stored) : { count: 0, windowStart: now };

      if (now - data.windowStart > windowMs) {
        // Reset window
        data.count = 1;
        data.windowStart = now;
      } else {
        data.count++;
      }

      localStorage.setItem(rateLimitKey, JSON.stringify(data));

      if (data.count > maxRequests) {
        console.warn('Template rate limit exceeded for user:', userId);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return true; // Allow on error to avoid blocking legitimate users
    }
  },

  // Detect suspicious email history patterns
  async detectSuspiciousEmailActivity(userId: string): Promise<boolean> {
    try {
      const recentEvents = this.getRecentSecurityEvents(userId, 'email_history_operation', 5 * 60 * 1000); // Last 5 minutes
      const createEvents = recentEvents.filter(e => e.metadata?.action === 'create');

      if (createEvents.length > 20) { // More than 20 email insertions in 5 minutes
        console.warn('Suspicious email history activity detected for user:', userId);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Suspicious activity detection failed:', error);
      return false;
    }
  },

  // Helper methods
  async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  },

  storeSecurityEvent(event: SecurityEvent): void {
    const key = 'security_events';
    const stored = localStorage.getItem(key);
    const events = stored ? JSON.parse(stored) : [];
    
    events.push(event);
    
    // Keep only last 1000 events
    if (events.length > 1000) {
      events.splice(0, events.length - 1000);
    }
    
    localStorage.setItem(key, JSON.stringify(events));
  },

  getRecentSecurityEvents(userId: string, eventType: string, timeWindowMs: number): SecurityEvent[] {
    const key = 'security_events';
    const stored = localStorage.getItem(key);
    const events: SecurityEvent[] = stored ? JSON.parse(stored) : [];
    const cutoff = Date.now() - timeWindowMs;

    return events.filter(event => 
      event.user_id === userId &&
      event.event_type === eventType &&
      new Date(event.metadata?.timestamp || 0).getTime() > cutoff
    );
  }
};
