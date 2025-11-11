import { useEffect } from 'react';
import { financeEventBus, FINANCE_EVENTS } from '@/stores/financeStore';

/**
 * Hook to subscribe to finance events and trigger callbacks
 * Ensures automatic cleanup on unmount
 */
export const useFinanceEvents = (handlers: {
  onInvoiceUpdated?: (data: any) => void;
  onPaymentRecorded?: (data: any) => void;
  onReminderSent?: (data: any) => void;
  onFlagUpdated?: (data: any) => void;
  onCustomerRefresh?: (customerId: string) => void;
  onGlobalRefresh?: () => void;
}) => {
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];

    if (handlers.onInvoiceUpdated) {
      unsubscribers.push(
        financeEventBus.on(FINANCE_EVENTS.INVOICE_UPDATED, handlers.onInvoiceUpdated)
      );
    }

    if (handlers.onPaymentRecorded) {
      unsubscribers.push(
        financeEventBus.on(FINANCE_EVENTS.PAYMENT_RECORDED, handlers.onPaymentRecorded)
      );
    }

    if (handlers.onReminderSent) {
      unsubscribers.push(
        financeEventBus.on(FINANCE_EVENTS.REMINDER_SENT, handlers.onReminderSent)
      );
    }

    if (handlers.onFlagUpdated) {
      unsubscribers.push(
        financeEventBus.on(FINANCE_EVENTS.FLAG_UPDATED, handlers.onFlagUpdated)
      );
    }

    if (handlers.onCustomerRefresh) {
      unsubscribers.push(
        financeEventBus.on(FINANCE_EVENTS.CUSTOMER_REFRESH, handlers.onCustomerRefresh)
      );
    }

    if (handlers.onGlobalRefresh) {
      unsubscribers.push(
        financeEventBus.on(FINANCE_EVENTS.GLOBAL_REFRESH, handlers.onGlobalRefresh)
      );
    }

    // Cleanup all subscriptions on unmount
    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [
    handlers.onInvoiceUpdated,
    handlers.onPaymentRecorded,
    handlers.onReminderSent,
    handlers.onFlagUpdated,
    handlers.onCustomerRefresh,
    handlers.onGlobalRefresh,
  ]);
};
