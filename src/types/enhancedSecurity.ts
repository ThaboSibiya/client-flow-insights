export interface EnhancedEmployeePrivileges {
  // Existing privileges
  can_view_customers: boolean;
  can_edit_customers: boolean;
  can_delete_customers: boolean;
  can_view_quotes: boolean;
  can_create_quotes: boolean;
  can_edit_quotes: boolean;
  can_delete_quotes: boolean;
  can_view_analytics: boolean;
  can_manage_employees: boolean;
  can_update_customer_status_onsite: boolean;
  
  // New automation privileges
  can_view_automations: boolean;
  can_create_automations: boolean;
  can_edit_automations: boolean;
  can_delete_automations: boolean;
  can_execute_automations: boolean;
  can_manage_automation_permissions: boolean;
  automation_scope: 'own_customers' | 'department' | 'all_company';
  can_access_sensitive_automations: boolean;
  
  // New granular settings privileges
  can_view_company_settings: boolean;
  can_edit_basic_settings: boolean;
  can_edit_integration_settings: boolean;
  can_edit_security_settings: boolean;
  can_edit_billing_settings: boolean;
  can_manage_employee_settings: boolean;
  
  // Data access controls
  customer_access_scope: 'assigned_only' | 'team' | 'department' | 'all_company';
  can_access_customer_pii: boolean;
  can_export_customer_data: boolean;
  
  // Financial controls
  can_access_financial_automations: boolean;
  can_modify_pricing_automations: boolean;
  requires_financial_approval: boolean;

  // AI Agent (Quikle AI) controls
  can_use_ai_agent: boolean;
  can_create_ai_workflows: boolean;
}

export interface AutomationPermission {
  id: string;
  automation_id: string;
  employee_id: string;
  permission_level: 'view' | 'execute' | 'edit' | 'admin';
  granted_by?: string;
  granted_at: string;
  expires_at?: string;
}

export interface PrivilegeChangeAudit {
  id: string;
  employee_id: string;
  changed_by: string;
  privilege_name: string;
  old_value?: boolean;
  new_value?: boolean;
  reason?: string;
  ip_address?: string;
  created_at: string;
}
