export interface Equipment {
  id: string;
  customer_id: string;
  equipment_type: string;
  brand: string;
  model: string;
  serial_number: string;
  status: 'active' | 'maintenance' | 'broken' | 'retired';
  purchase_date?: string;
  warranty_expiry?: string;
  notes?: string;
  technical_issues?: string;
  last_service_date?: string;
  next_service_due?: string;
  total_services: number;
  created_at: string;
  updated_at: string;
}

export interface ServiceHistoryEntry {
  id: string;
  equipment_id: string;
  customer_id: string;
  service_type: 'maintenance' | 'repair' | 'inspection' | 'installation' | 'replacement';
  service_date: string;
  performed_by?: string;
  description: string;
  resolution?: string;
  parts_used?: string[];
  labor_cost: number;
  parts_cost: number;
  total_cost: number;
  ticket_id?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  next_service_due?: string;
  created_at: string;
  updated_at: string;
}

export interface EquipmentFormData {
  equipment_type: string;
  brand: string;
  model: string;
  serial_number: string;
  status: string;
  purchase_date: string;
  warranty_expiry: string;
  notes: string;
  technical_issues: string;
}

export interface ServiceFormData {
  service_type: string;
  service_date: string;
  performed_by: string;
  description: string;
  resolution: string;
  parts_used: string;
  labor_cost: number;
  parts_cost: number;
  next_service_due: string;
  status: string;
}
