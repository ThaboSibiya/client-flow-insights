import { useEffect } from 'react';
import { ticketEventBus, TICKET_EVENTS } from '@/stores/ticketEventBus';

/**
 * Hook for subscribing to ticket events
 * Accepts optional callbacks that will be subscribed to ticket events
 */
export const useTicketEvents = (handlers?: {
  onTicketCreated?: (data: any) => void;
  onTicketUpdated?: (data: any) => void;
  onTicketDeleted?: (data: any) => void;
  onTicketStatusChanged?: (data: any) => void;
  onTicketPriorityChanged?: (data: any) => void;
  onTicketAssigned?: (data: any) => void;
  onTicketEscalated?: (data: any) => void;
  onCommentAdded?: (data: any) => void;
  onTimeEntryAdded?: (data: any) => void;
  onTicketMovedToStage?: (data: any) => void;
  onTicketSLABreach?: (data: any) => void;
  onCustomerTicketsRefresh?: (data: any) => void;
  onPipelineRefresh?: () => void;
  onGlobalTicketsRefresh?: () => void;
}) => {
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    if (handlers?.onTicketCreated) {
      unsubscribers.push(ticketEventBus.on(TICKET_EVENTS.TICKET_CREATED, handlers.onTicketCreated));
    }
    if (handlers?.onTicketUpdated) {
      unsubscribers.push(ticketEventBus.on(TICKET_EVENTS.TICKET_UPDATED, handlers.onTicketUpdated));
    }
    if (handlers?.onTicketDeleted) {
      unsubscribers.push(ticketEventBus.on(TICKET_EVENTS.TICKET_DELETED, handlers.onTicketDeleted));
    }
    if (handlers?.onTicketStatusChanged) {
      unsubscribers.push(ticketEventBus.on(TICKET_EVENTS.TICKET_STATUS_CHANGED, handlers.onTicketStatusChanged));
    }
    if (handlers?.onTicketPriorityChanged) {
      unsubscribers.push(ticketEventBus.on(TICKET_EVENTS.TICKET_PRIORITY_CHANGED, handlers.onTicketPriorityChanged));
    }
    if (handlers?.onTicketAssigned) {
      unsubscribers.push(ticketEventBus.on(TICKET_EVENTS.TICKET_ASSIGNED, handlers.onTicketAssigned));
    }
    if (handlers?.onTicketEscalated) {
      unsubscribers.push(ticketEventBus.on(TICKET_EVENTS.TICKET_ESCALATED, handlers.onTicketEscalated));
    }
    if (handlers?.onCommentAdded) {
      unsubscribers.push(ticketEventBus.on(TICKET_EVENTS.COMMENT_ADDED, handlers.onCommentAdded));
    }
    if (handlers?.onTimeEntryAdded) {
      unsubscribers.push(ticketEventBus.on(TICKET_EVENTS.TIME_ENTRY_ADDED, handlers.onTimeEntryAdded));
    }
    if (handlers?.onTicketMovedToStage) {
      unsubscribers.push(ticketEventBus.on(TICKET_EVENTS.TICKET_MOVED_TO_STAGE, handlers.onTicketMovedToStage));
    }
    if (handlers?.onTicketSLABreach) {
      unsubscribers.push(ticketEventBus.on(TICKET_EVENTS.TICKET_SLA_BREACH, handlers.onTicketSLABreach));
    }
    if (handlers?.onCustomerTicketsRefresh) {
      unsubscribers.push(ticketEventBus.on(TICKET_EVENTS.CUSTOMER_TICKETS_REFRESH, handlers.onCustomerTicketsRefresh));
    }
    if (handlers?.onPipelineRefresh) {
      unsubscribers.push(ticketEventBus.on(TICKET_EVENTS.PIPELINE_REFRESH, handlers.onPipelineRefresh));
    }
    if (handlers?.onGlobalTicketsRefresh) {
      unsubscribers.push(ticketEventBus.on(TICKET_EVENTS.GLOBAL_TICKETS_REFRESH, handlers.onGlobalTicketsRefresh));
    }

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [
    handlers?.onTicketCreated,
    handlers?.onTicketUpdated,
    handlers?.onTicketDeleted,
    handlers?.onTicketStatusChanged,
    handlers?.onTicketPriorityChanged,
    handlers?.onTicketAssigned,
    handlers?.onTicketEscalated,
    handlers?.onCommentAdded,
    handlers?.onTimeEntryAdded,
    handlers?.onTicketMovedToStage,
    handlers?.onTicketSLABreach,
    handlers?.onCustomerTicketsRefresh,
    handlers?.onPipelineRefresh,
    handlers?.onGlobalTicketsRefresh,
  ]);
};
