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
  updatedAt: Date;
  contact_person?: string;
  company_address?: string;
  equipment?: CustomerEquipment[];
  activeTickets?: CustomerTicket[];
  ticketCount?: number;
  lastTicketDate?: Date;
  assigned_to?: string;
  user_id: string;
}

export type CustomerStatus = 'new' | 'existing' | 'pending' | 'finalised';

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

export interface CustomerTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  customerId: string;
  assignedTo?: TeamMember;
  createdAt: Date;
  updatedAt: Date;
  totalTimeSpent?: number;
  timeEntries?: TimeEntry[];
}

export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TimeEntry {
  id: string;
  ticketId: string;
  employeeId: string;
  description: string;
  hours: number;
  duration: number;
  date: Date;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  userId: string;
  userName: string;
}

export interface TicketTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultPriority: TicketPriority;
  estimatedTime?: number;
  subject: string;
  priority: TicketPriority;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}
