
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  createdAt: Date;
  contact_person?: string;
  company_address?: string;
  equipment?: Array<{
    id: string;
    equipment_type: string;
    brand?: string;
    model?: string;
    serial_number?: string;
  }>;
  activeTickets?: Array<any>;
  ticketCount?: number;
  lastTicketDate?: Date;
}

export type CustomerStatus = 'new' | 'existing' | 'pending' | 'finalised';
