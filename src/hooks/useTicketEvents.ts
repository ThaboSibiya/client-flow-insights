import { useEffect } from 'react';
import { ticketEventBus, TICKET_EVENTS } from '@/stores/ticketEventBus';

/**
 * Hook for subscribing to ticket events
 * Enables components to react to ticket-related changes across the app
 */
export const useTicketEvents = () => {
  /**
   * Subscribe to ticket created event
   */
  const onTicketCreated = (callback: (data: any) => void) => {
    useEffect(() => {
      return ticketEventBus.on(TICKET_EVENTS.TICKET_CREATED, callback);
    }, [callback]);
  };

  /**
   * Subscribe to ticket updated event
   */
  const onTicketUpdated = (callback: (data: any) => void) => {
    useEffect(() => {
      return ticketEventBus.on(TICKET_EVENTS.TICKET_UPDATED, callback);
    }, [callback]);
  };

  /**
   * Subscribe to ticket deleted event
   */
  const onTicketDeleted = (callback: (data: any) => void) => {
    useEffect(() => {
      return ticketEventBus.on(TICKET_EVENTS.TICKET_DELETED, callback);
    }, [callback]);
  };

  /**
   * Subscribe to ticket status changed event
   */
  const onTicketStatusChanged = (callback: (data: any) => void) => {
    useEffect(() => {
      return ticketEventBus.on(TICKET_EVENTS.TICKET_STATUS_CHANGED, callback);
    }, [callback]);
  };

  /**
   * Subscribe to ticket priority changed event
   */
  const onTicketPriorityChanged = (callback: (data: any) => void) => {
    useEffect(() => {
      return ticketEventBus.on(TICKET_EVENTS.TICKET_PRIORITY_CHANGED, callback);
    }, [callback]);
  };

  /**
   * Subscribe to ticket assigned event
   */
  const onTicketAssigned = (callback: (data: any) => void) => {
    useEffect(() => {
      return ticketEventBus.on(TICKET_EVENTS.TICKET_ASSIGNED, callback);
    }, [callback]);
  };

  /**
   * Subscribe to ticket escalated event
   */
  const onTicketEscalated = (callback: (data: any) => void) => {
    useEffect(() => {
      return ticketEventBus.on(TICKET_EVENTS.TICKET_ESCALATED, callback);
    }, [callback]);
  };

  /**
   * Subscribe to comment added event
   */
  const onCommentAdded = (callback: (data: any) => void) => {
    useEffect(() => {
      return ticketEventBus.on(TICKET_EVENTS.COMMENT_ADDED, callback);
    }, [callback]);
  };

  /**
   * Subscribe to time entry added event
   */
  const onTimeEntryAdded = (callback: (data: any) => void) => {
    useEffect(() => {
      return ticketEventBus.on(TICKET_EVENTS.TIME_ENTRY_ADDED, callback);
    }, [callback]);
  };

  /**
   * Subscribe to ticket moved to stage event
   */
  const onTicketMovedToStage = (callback: (data: any) => void) => {
    useEffect(() => {
      return ticketEventBus.on(TICKET_EVENTS.TICKET_MOVED_TO_STAGE, callback);
    }, [callback]);
  };

  /**
   * Subscribe to SLA breach event
   */
  const onTicketSLABreach = (callback: (data: any) => void) => {
    useEffect(() => {
      return ticketEventBus.on(TICKET_EVENTS.TICKET_SLA_BREACH, callback);
    }, [callback]);
  };

  /**
   * Subscribe to customer tickets refresh event
   */
  const onCustomerTicketsRefresh = (callback: (data: any) => void) => {
    useEffect(() => {
      return ticketEventBus.on(TICKET_EVENTS.CUSTOMER_TICKETS_REFRESH, callback);
    }, [callback]);
  };

  /**
   * Subscribe to pipeline refresh event
   */
  const onPipelineRefresh = (callback: () => void) => {
    useEffect(() => {
      return ticketEventBus.on(TICKET_EVENTS.PIPELINE_REFRESH, callback);
    }, [callback]);
  };

  /**
   * Subscribe to global tickets refresh event
   */
  const onGlobalTicketsRefresh = (callback: () => void) => {
    useEffect(() => {
      return ticketEventBus.on(TICKET_EVENTS.GLOBAL_TICKETS_REFRESH, callback);
    }, [callback]);
  };

  return {
    onTicketCreated,
    onTicketUpdated,
    onTicketDeleted,
    onTicketStatusChanged,
    onTicketPriorityChanged,
    onTicketAssigned,
    onTicketEscalated,
    onCommentAdded,
    onTimeEntryAdded,
    onTicketMovedToStage,
    onTicketSLABreach,
    onCustomerTicketsRefresh,
    onPipelineRefresh,
    onGlobalTicketsRefresh,
  };
};
