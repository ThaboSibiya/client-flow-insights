
import { Customer } from '@/types/customer';

export const createSortFunction = (sortBy: string, sortOrder: 'asc' | 'desc') => {
  return (a: Customer, b: Customer) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'createdAt':
        aValue = a.createdAt;
        bValue = b.createdAt;
        break;
      case 'ticketCount':
        aValue = a.ticketCount || 0;
        bValue = b.ticketCount || 0;
        break;
      case 'lastActivity':
        aValue = a.lastTicketDate || a.createdAt;
        bValue = b.lastTicketDate || b.createdAt;
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  };
};
