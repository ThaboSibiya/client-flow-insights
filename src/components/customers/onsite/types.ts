
import { CustomerStatus } from '@/types/customer';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  notes: string;
}

export interface OnSiteStatusUpdateProps {
  isOpen: boolean;
  onClose: () => void;
}
