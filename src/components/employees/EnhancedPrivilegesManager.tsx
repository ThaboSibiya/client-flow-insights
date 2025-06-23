
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Shield, Save, AlertTriangle, Users, Settings, Lock, DollarSign, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { EnhancedEmployeePrivileges, getDefaultPrivileges, logPrivilegeChange } from '@/services/enhancedSecurityService';

interface EnhancedPrivilegesManagerProps {
  employeeId?: string;
}

const EnhancedPrivilegesManager = ({ employeeId }: EnhancedPrivilegesManagerProps) => {
  const [privileges, setPrivileges] = useState<EnhancedEmployeePrivileges>(getDefaultPrivileges());
  const [originalPrivileges, setOriginalPrivileges] = useState<EnhancedEmployeePrivileges>(getDefaultPrivileges());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changeReason, setChangeReason] = useState('');

  useEffect(() => {
    if (employeeId) {
      loadPrivileges();
    }
  }, [employeeId]);

  const loadPrivileges = async () => {
    if (!employeeId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employee_privileges')
        .select('*')
        .eq('employee_id', employeeId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const currentPrivileges = data ? {
        can_view_customers: data.can_view_customers || false,
        can_edit_customers: data.can_edit_customers || false,
        can_delete_customers: data.can_delete_customers || false,
        can_view_quotes: data.can_view_quotes || false,
        can_create_quotes: data.can_create_quotes || false,
        can_edit_quotes: data.can_edit_quotes || false,
        can_delete_quotes: data.can_delete_quotes || false,
        can_view_analytics: data.can_view_analytics || false,
        can_manage_employees: data.can_manage_employees || false,
        can_update_customer_status_onsite: data.can_update_customer_status_onsite || false,
        can_view_automations: data.can_view_automations || false,
        can_create_automations: data.can_create_automations || false,
        can_edit_automations: data.can_edit_automations || false,
        can_delete_automations: data.can_delete_automations || false,
        can_execute_automations: data.can_execute_automations || false,
        can_manage_automation_permissions: data.can_manage_automation_permissions || false,
        automation_scope: data.automation_scope || 'own_customers',
        can_access_sensitive_automations: data.can_access_sensitive_automations || false,
        can_view_company_settings: data.can_view_company_settings || false,
        can_edit_basic_settings: data.can_edit_basic_settings || false,
        can_edit_integration_settings: data.can_edit_integration_settings || false,
        can_edit_security_settings: data.can_edit_security_settings || false,
        can_edit_billing_settings: data.can_edit_billing_settings || false,
        can_manage_employee_settings: data.can_manage_employee_settings || false,
        customer_access_scope: data.customer_access_scope || 'assigned_only',
        can_access_customer_pii: data.can_access_customer_pii || false,
        can_export_customer_data: data.can_export_customer_data || false,
        can_access_financial_automations: data.can_access_financial_automations || false,
        can_modify_pricing_automations: data.can_modify_pricing_automations || false,
        requires_financial_approval: data.requires_financial_approval !== false
      } : getDefaultPrivileges();

      setPrivileges(currentPrivileges);
      setOriginalPrivileges(currentPrivileges);
    } catch (error: any) {
      console.error('Error loading privileges:', error);
      toast({
        title: "Error",
        description: "Failed to load employee privileges",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrivilegeChange = (privilege: keyof EnhancedEmployeePrivileges, value: boolean | string) => {
    setPrivileges(prev => ({
      ...prev,
      [privilege]: value
    }));
  };

  const savePrivileges = async () => {
    if (!employeeId) {
      toast({
        title: "Error",
        description: "Please save the employee first before setting privileges",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const privilegeData = {
        employee_id: employeeId,
        privilege_name: 'enhanced_privileges',
        privilege_description: 'Enhanced employee privileges with granular controls',
        ...privileges
      };

      const { error } = await supabase
        .from('employee_privileges')
        .upsert([privilegeData], {
          onConflict: 'employee_id'
        });

      if (error) throw error;

      // Log changes for audit trail
      for (const [key, value] of Object.entries(privileges)) {
        const oldValue = originalPrivileges[key as keyof EnhancedEmployeePrivileges];
        if (typeof value === 'boolean' && typeof oldValue === 'boolean' && value !== oldValue) {
          await logPrivilegeChange(employeeId, key, oldValue, value, changeReason);
        }
      }

      setOriginalPrivileges(privileges);
      setChangeReason('');

      toast({
        title: "Success",
        description: "Employee privileges updated successfully"
      });
    } catch (error: any) {
      console.error('Error saving privileges:', error);
      toast({
        title: "Error",
        description: "Failed to save employee privileges",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    return JSON.stringify(privileges) !== JSON.stringify(originalPrivileges);
  };

  const privilegeGroups = [
    {
      title: "Customer Management",
      icon: <Users className="h-5 w-5" />,
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
      icon: <Zap className="h-5 w-5" />,
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
      icon: <Settings className="h-5 w-5" />,
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
      icon: <Lock className="h-5 w-5" />,
      color: "text-red-600",
      privileges: [
        { key: 'can_access_customer_pii', label: 'Customer PII', description: 'Access sensitive customer personal information' },
        { key: 'can_export_customer_data', label: 'Export Data', description: 'Download/export customer data' }
      ]
    },
    {
      title: "Financial Controls",
      icon: <DollarSign className="h-5 w-5" />,
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
      icon: <Shield className="h-5 w-5" />,
      color: "text-indigo-600",
      privileges: [
        { key: 'can_view_analytics', label: 'View Analytics', description: 'Access reports and analytics dashboards' }
      ]
    }
  ];

  if (loading) {
    return <div className="text-center py-8 text-quikle-slate">Loading enhanced privileges...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-quikle-charcoal">
            <Shield className="h-5 w-5 text-quikle-primary" />
            Enhanced Security Privileges
          </CardTitle>
          <p className="text-sm text-quikle-slate">
            Configure granular access controls for automation, settings, and data access
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scope Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-quikle-crystal/30 rounded-lg">
            <div>
              <Label className="text-sm font-medium text-quikle-charcoal">Automation Scope</Label>
              <Select
                value={privileges.automation_scope}
                onValueChange={(value) => handlePrivilegeChange('automation_scope', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="own_customers">Own Customers Only</SelectItem>
                  <SelectItem value="department">Department Customers</SelectItem>
                  <SelectItem value="all_company">All Company Customers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium text-quikle-charcoal">Customer Access Scope</Label>
              <Select
                value={privileges.customer_access_scope}
                onValueChange={(value) => handlePrivilegeChange('customer_access_scope', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assigned_only">Assigned Only</SelectItem>
                  <SelectItem value="team">Team Customers</SelectItem>
                  <SelectItem value="department">Department Customers</SelectItem>
                  <SelectItem value="all_company">All Company Customers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Privilege Groups */}
          {privilegeGroups.map((group) => (
            <Card key={group.title} className="border">
              <CardHeader className="pb-3">
                <CardTitle className={`flex items-center gap-2 text-base ${group.color}`}>
                  {group.icon}
                  {group.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {group.privileges.map((privilege) => (
                  <div key={privilege.key} className="flex items-center justify-between space-x-4 p-3 rounded-lg bg-quikle-crystal/20">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={privilege.key} className="text-quikle-charcoal font-medium">
                          {privilege.label}
                        </Label>
                        {privilege.key.includes('sensitive') || privilege.key.includes('security') || privilege.key.includes('financial') ? (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            High Risk
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-sm text-quikle-slate mt-1">{privilege.description}</p>
                    </div>
                    <Switch
                      id={privilege.key}
                      checked={privileges[privilege.key as keyof EnhancedEmployeePrivileges] as boolean}
                      onCheckedChange={(value) => handlePrivilegeChange(privilege.key as keyof EnhancedEmployeePrivileges, value)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          {/* Special Controls */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-orange-800 font-medium">Requires Financial Approval</Label>
                  <p className="text-sm text-orange-700">Financial operations require manager approval</p>
                </div>
                <Switch
                  checked={privileges.requires_financial_approval}
                  onCheckedChange={(value) => handlePrivilegeChange('requires_financial_approval', value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Change Reason */}
          {hasChanges() && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-quikle-charcoal">Reason for Changes (Optional)</Label>
              <Textarea
                placeholder="Describe why these privilege changes are being made..."
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                className="border-quikle-silver"
              />
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-quikle-silver">
            <Button
              onClick={savePrivileges}
              disabled={saving || !employeeId || !hasChanges()}
              className="bg-quikle-primary hover:bg-quikle-secondary text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Enhanced Privileges'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedPrivilegesManager;
