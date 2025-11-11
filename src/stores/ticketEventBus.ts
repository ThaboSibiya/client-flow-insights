/**
 * Event Bus for Ticket Management System
 * Enables cross-page communication between Customer and Pipeline pages
 */

type EventCallback = (data: any) => void;

export const TICKET_EVENTS = {
  // Ticket lifecycle events
  TICKET_CREATED: 'ticket:created',
  TICKET_UPDATED: 'ticket:updated',
  TICKET_DELETED: 'ticket:deleted',
  TICKET_STATUS_CHANGED: 'ticket:status_changed',
  TICKET_PRIORITY_CHANGED: 'ticket:priority_changed',
  TICKET_ASSIGNED: 'ticket:assigned',
  TICKET_ESCALATED: 'ticket:escalated',
  
  // Comment events
  COMMENT_ADDED: 'comment:added',
  COMMENT_UPDATED: 'comment:updated',
  COMMENT_DELETED: 'comment:deleted',
  
  // Time tracking events
  TIME_ENTRY_ADDED: 'time:entry_added',
  TIME_ENTRY_UPDATED: 'time:entry_updated',
  
  // Attachment events
  ATTACHMENT_ADDED: 'attachment:added',
  ATTACHMENT_DELETED: 'attachment:deleted',
  
  // Pipeline integration events
  TICKET_MOVED_TO_STAGE: 'ticket:moved_to_stage',
  TICKET_SLA_BREACH: 'ticket:sla_breach',
  
  // Bulk operations
  TICKETS_BULK_UPDATED: 'tickets:bulk_updated',
  
  // Refresh events
  CUSTOMER_TICKETS_REFRESH: 'customer:tickets_refresh',
  PIPELINE_REFRESH: 'pipeline:refresh',
  GLOBAL_TICKETS_REFRESH: 'global:tickets_refresh',
} as const;

class TicketEventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  /**
   * Subscribe to a ticket event
   */
  on(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event)!.add(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from a ticket event
   */
  off(event: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * Emit a ticket event
   */
  emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ticket event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Clear all listeners for an event or all events
   */
  clear(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

export const ticketEventBus = new TicketEventBus();
