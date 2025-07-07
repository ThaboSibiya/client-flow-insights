
import { FilterPreset } from './types';
import { getDateRange } from '@/utils/dateUtils';

export const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'new-customers',
    name: 'New Customers',
    filters: {
      status: 'new',
      ticketFilter: 'all',
      dateRange: { start: null, end: null },
      searchQuery: '',
    },
  },
  {
    id: 'urgent-tickets',
    name: 'Urgent Tickets',
    filters: {
      status: 'all',
      ticketFilter: 'urgent-tickets',
      dateRange: { start: null, end: null },
      searchQuery: '',
    },
  },
  {
    id: 'recent-customers',
    name: 'Last 7 Days',
    filters: {
      status: 'all',
      ticketFilter: 'all',
      dateRange: getDateRange('week'),
      searchQuery: '',
    },
  },
  {
    id: 'active-tickets',
    name: 'Active Tickets',
    filters: {
      status: 'all',
      ticketFilter: 'open-tickets',
      dateRange: { start: null, end: null },
      searchQuery: '',
    },
  },
];
