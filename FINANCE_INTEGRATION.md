# Finance System Integration

## Overview
The Finance system now has centralized state management and event-driven communication between the main Finance page and customer-specific finance views.

## Architecture

### Centralized State Store (`src/stores/financeStore.ts`)
- **Global Stats**: Tracks total overdue, debtor count, risk ratings
- **Cache Management**: Prevents unnecessary refetches with timestamp tracking
- **Event Bus**: Cross-page communication system

### Event System
Finance events allow different parts of the app to react to changes:

#### Available Events
- `INVOICE_UPDATED`: Fired when invoice status changes
- `PAYMENT_RECORDED`: Fired when a payment is recorded
- `REMINDER_SENT`: Fired when a reminder is sent
- `FLAG_UPDATED`: Fired when account flag status changes
- `CUSTOMER_REFRESH`: Fired when specific customer needs refresh
- `GLOBAL_REFRESH`: Fired when all finance data needs refresh

#### Usage Example
```typescript
import { useFinanceEvents } from '@/hooks/useFinanceEvents';

// In any component
useFinanceEvents({
  onPaymentRecorded: (data) => {
    console.log('Payment recorded:', data);
    // Auto-refresh your data
  },
  onReminderSent: (data) => {
    // Update UI when reminder sent
  }
});
```

## Data Flow

### Main Finance Page → Customer Finance
1. User sends reminder from main Finance page
2. `BulkReminderPanel` emits `REMINDER_SENT` event
3. `CustomerFinanceTab` (if open) listens and auto-refreshes
4. Customer sees updated reminder history immediately

### Customer Finance → Main Finance
1. User records payment in customer view
2. `useFinanceBackend` emits `PAYMENT_RECORDED` event
3. `useDebtorData` (main page) listens and refetches
4. Main Finance page shows updated stats

## Benefits

✅ **Real-time Sync**: Changes in one view immediately reflect in another
✅ **No Manual Refresh**: Auto-refresh triggered by events
✅ **Audit Trail**: All finance actions logged to `finance_audit_logs`
✅ **Cache Optimization**: Prevents redundant API calls
✅ **Type Safety**: Full TypeScript support for events

## Components Updated

### Hooks
- `useFinanceBackend`: Now emits events for invoice/payment/flag changes
- `useDebtorData`: Listens to finance events, auto-refreshes
- `useFinanceEvents`: New hook for subscribing to events

### Components
- `BulkReminderPanel`: Emits events when reminders sent
- `CustomerFinanceTab`: Auto-refreshes on relevant events

## Testing Cross-Page Communication

1. Open main Finance page (`/finance`)
2. In another tab, open a customer's finance view
3. Record a payment in customer view
4. Switch to Finance page - stats auto-update
5. Send reminder from Finance page
6. Switch to customer view - reminder history auto-updates
