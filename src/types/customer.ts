
export type CustomerStatus = 'new' | 'existing' | 'pending' | 'finalised';

export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

export interface CustomerTicket {
  id: string;
  ticketNumber: string;
  status: TicketStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  activeTickets: CustomerTicket[];
  ticketCount: number;
  lastTicketDate?: Date;
}

export interface CRMContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'activeTickets' | 'ticketCount'>) => void;
  updateCustomerStatus: (id: string, status: CustomerStatus) => void;
  updateCustomer: (id: string, customerData: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  createTicket: (customerId: string, ticket: Omit<CustomerTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>) => void;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => void;
}
