
import { Users, Settings, Lock, DollarSign, Zap, Shield, Sparkles } from 'lucide-react';

export const privilegeGroups = [
  {
    title: "Customer Management",
    icon: Users,
    color: "text-blue-600",
    privileges: [
      { key: 'can_view_customers', label: 'View Customers', description: 'Access customer information and profiles' },
      { key: 'can_edit_customers', label: 'Edit Customers', description: 'Modify customer details and information' },
      { key: 'can_delete_customers', label: 'Delete Customers', description: 'Remove customers from system' },
      { key: 'can_update_customer_status_onsite', label: 'Update Status (Mobile)', description: 'Update customer status after on-site jobs' }
    ]
  },
  {
    title: "Automation Controls",
    icon: Zap,
    color: "text-purple-600",
    privileges: [
      { key: 'can_view_automations', label: 'View Automations', description: 'See existing automation workflows' },
      { key: 'can_create_automations', label: 'Create Automations', description: 'Build new automation workflows' },
      { key: 'can_edit_automations', label: 'Edit Automations', description: 'Modify existing automation workflows' },
      { key: 'can_delete_automations', label: 'Delete Automations', description: 'Remove automation workflows' },
      { key: 'can_execute_automations', label: 'Execute Automations', description: 'Manually trigger automation workflows' },
      { key: 'can_manage_automation_permissions', label: 'Manage Permissions', description: 'Grant/revoke automation access to others' },
      { key: 'can_access_sensitive_automations', label: 'Sensitive Automations', description: 'Access automations with sensitive data' }
    ]
  },
  {
    title: "Company Settings",
    icon: Settings,
    color: "text-green-600",
    privileges: [
      { key: 'can_view_company_settings', label: 'View Settings', description: 'Access company configuration' },
      { key: 'can_edit_basic_settings', label: 'Basic Settings', description: 'Modify themes, notifications, general settings' },
      { key: 'can_edit_integration_settings', label: 'Integration Settings', description: 'Manage API keys, webhooks, third-party integrations' },
      { key: 'can_edit_security_settings', label: 'Security Settings', description: 'Modify authentication and security policies' },
      { key: 'can_edit_billing_settings', label: 'Billing Settings', description: 'Access billing and subscription management' },
      { key: 'can_manage_employee_settings', label: 'Employee Settings', description: 'Control employee access and privileges' }
    ]
  },
  {
    title: "Data & Security",
    icon: Lock,
    color: "text-red-600",
    privileges: [
      { key: 'can_access_customer_pii', label: 'Customer PII', description: 'Access sensitive customer personal information' },
      { key: 'can_export_customer_data', label: 'Export Data', description: 'Download/export customer data' }
    ]
  },
  {
    title: "Financial Controls",
    icon: DollarSign,
    color: "text-orange-600",
    privileges: [
      { key: 'can_view_quotes', label: 'View Quotes', description: 'Access quotes and invoices' },
      { key: 'can_create_quotes', label: 'Create Quotes', description: 'Generate new quotes and invoices' },
      { key: 'can_edit_quotes', label: 'Edit Quotes', description: 'Modify existing quotes and invoices' },
      { key: 'can_delete_quotes', label: 'Delete Quotes', description: 'Remove quotes and invoices' },
      { key: 'can_access_financial_automations', label: 'Financial Automations', description: 'Access automations involving financial data' },
      { key: 'can_modify_pricing_automations', label: 'Pricing Automations', description: 'Modify pricing-related automation logic' }
    ]
  },
  {
    title: "Analytics & Reporting",
    icon: Shield,
    color: "text-indigo-600",
    privileges: [
      { key: 'can_view_analytics', label: 'View Analytics', description: 'Access reports and analytics dashboards' }
    ]
  },
  {
    title: "AI Agent (Quikle AI)",
    icon: Sparkles,
    color: "text-pink-600",
    privileges: [
      { key: 'can_use_ai_agent', label: 'Use AI Agent', description: 'Open and chat with the Quikle AI assistant' },
      { key: 'can_create_ai_workflows', label: 'Create AI Workflows', description: 'Ask the AI to build automations and workflows' }
    ]
  }
];
