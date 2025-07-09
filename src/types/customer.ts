
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status: CustomerStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  createdAt: Date;
  contact_person?: string;
  company_address?: string;
  equipment?: CustomerEquipment[];
  activeTickets?: CustomerTicket[];
  ticketCount?: number;
  lastTicketDate?: Date;
}

export type CustomerStatus = 'new' | 'existing' | 'pending' | 'finalised';

export interface CustomerEquipment {
  id: string;
  equipment_type: string;
  brand?: string;
  model?: string;
  serial_number?: string;
  purchase_date?: string;
  warranty_expiry?: string;
  notes?: string;
}

export interface CustomerTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  customerId: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  totalTimeSpent?: number;
}

export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TimeEntry {
  id: string;
  ticketId: string;
  description: string;
  hours: number;
  date: Date;
  employeeId: string;
}

export interface TicketTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultPriority: TicketPriority;
  estimatedTime?: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}
