
import { Customer, CustomerEquipment } from './customer';
import { CustomFieldValue, IndustryTemplate } from './customData';

export interface EnhancedCustomerProfile extends Customer {
  custom_fields: CustomFieldValue[];
  applied_templates: IndustryTemplate[];
  equipment?: CustomerEquipment[];
}

export interface CustomerWithContext {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  contact_person?: string;
  company_address?: string;
  status?: string;
  notes?: string;
  custom_fields: CustomFieldValue[];
  applied_templates: IndustryTemplate[];
  equipment: CustomerEquipment[];
  activeTickets: any[];
  ticketCount: number;
  createdAt: Date;
  updatedAt: Date;
}
