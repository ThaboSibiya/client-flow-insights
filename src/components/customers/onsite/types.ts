import { CustomerStatus } from '@/types/customer';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  notes: string;
}

export interface OnSiteTicket {
  id: string;
  ticket_number: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
}

export interface JobPhoto {
  id: string;
  name: string;
  url: string;
  path: string;
  type: 'before' | 'after' | 'general';
}

export interface OnSiteStatusUpdateProps {
  isOpen: boolean;
  onClose: () => void;
}
