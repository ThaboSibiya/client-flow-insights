
import { Customer } from '@/types/customer';

export const createFilterFunctions = (
  statusFilter: string,
  debouncedSearchQuery: string,
  dateRange: { start: Date | null; end: Date | null },
  ticketFilter: string
) => ({
  status: (customer: Customer) => statusFilter === 'all' || customer.status === statusFilter,
  
  search: (customer: Customer) => {
    if (!debouncedSearchQuery) return true;
    const query = debouncedSearchQuery.toLowerCase();
    
    // Search in basic customer fields
    const basicFieldsMatch = customer.name.toLowerCase().includes(query) ||
           customer.email.toLowerCase().includes(query) ||
           customer.phone.toLowerCase().includes(query);
    
    // Search in equipment fields (serial number, model, brand)
    const equipmentMatch = customer.equipment?.some(equipment => 
      equipment.serial_number?.toLowerCase().includes(query) ||
      equipment.model?.toLowerCase().includes(query) ||
      equipment.brand?.toLowerCase().includes(query)
    );
    
    return basicFieldsMatch || equipmentMatch;
  },
  
  dateRange: (customer: Customer) => {
    if (!dateRange.start && !dateRange.end) return true;
    if (dateRange.start && customer.createdAt < dateRange.start) return false;
    if (dateRange.end && customer.createdAt > dateRange.end) return false;
    return true;
  },
  
  ticket: (customer: Customer) => {
    switch (ticketFilter) {
      case 'with-tickets':
        return customer.ticketCount > 0;
      case 'no-tickets':
        return customer.ticketCount === 0;
      case 'urgent-tickets':
        return customer.activeTickets?.some(t => t.priority === 'urgent' && t.status !== 'closed') || false;
      case 'open-tickets':
        return customer.activeTickets?.some(t => t.status === 'open' || t.status === 'in-progress') || false;
      default:
        return true;
    }
  }
});
