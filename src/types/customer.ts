
export type CustomerStatus = 'new' | 'existing' | 'pending' | 'finalised';

export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

export interface TicketTemplate {
  id: string;
  name: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface TimeEntry {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  description: string;
  duration: number; // in minutes
  startTime: Date;
  endTime: Date;
  createdAt: Date;
}

export interface CustomerTicket {
  id: string;
  ticketNumber: string;
  status: TicketStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  description?: string;
  assignedTo?: TeamMember;
  createdAt: Date;
  updatedAt: Date;
  timeEntries: TimeEntry[];
  totalTimeSpent: number; // in minutes
  estimatedTime?: number; // in minutes
}

export interface CustomerEquipment {
  id: string;
  customer_id: string;
  user_id: string;
  equipment_type: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  purchase_date?: Date;
  warranty_expiry?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  contact_person?: string;
  company_address?: string;
  status: CustomerStatus;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  activeTickets: CustomerTicket[];
  ticketCount: number;
  lastTicketDate?: Date;
  assigned_to?: string; // Employee ID who is assigned to this customer
  assigned_to_email?: string; // Email of assigned employee
  territory?: string; // Customer's territory/region
  equipment?: CustomerEquipment[];
}

export interface CRMContextType {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'activeTickets' | 'ticketCount'>) => void;
  updateCustomerStatus: (id: string, status: CustomerStatus) => void;
  updateCustomer: (id: string, customerData: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  createTicket: (customerId: string, ticket: Omit<CustomerTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>) => void;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  addTimeEntry: (ticketId: string, timeEntry: Omit<TimeEntry, 'id' | 'ticketId' | 'createdAt'>) => void;
}
