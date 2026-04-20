import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { EnhancedEmployeePrivileges } from '@/types/enhancedSecurity';
import { getDefaultPrivileges } from '@/services/privilegeService';
import { logPrivilegeChange } from '@/services/privilegeAuditService';
import ScopeConfiguration from './privileges/ScopeConfiguration';
import PrivilegeGroup from './privileges/PrivilegeGroup';
import ChangeReasonInput from './privileges/ChangeReasonInput';
import FinancialApprovalControl from './privileges/FinancialApprovalControl';
import { privilegeGroups } from './privileges/privilegeGroupsData';

interface EnhancedPrivilegesManagerProps {
  employeeId?: string;
}

const EnhancedPrivilegesManager: React.FC<EnhancedPrivilegesManagerProps> = ({ employeeId }) => {
  const [privileges, setPrivileges] = useState<EnhancedEmployeePrivileges>(getDefaultPrivileges());
  const [originalPrivileges, setOriginalPrivileges] = useState<EnhancedEmployeePrivileges>(getDefaultPrivileges());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  const [existingPrivilegeId, setExistingPrivilegeId] = useState<string | null>(null);

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
        .maybeSingle();

      if (error) {
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
        automation_scope: (data.automation_scope as 'own_customers' | 'department' | 'all_company') || 'own_customers',
        can_access_sensitive_automations: data.can_access_sensitive_automations || false,
        can_view_company_settings: data.can_view_company_settings || false,
        can_edit_basic_settings: data.can_edit_basic_settings || false,
        can_edit_integration_settings: data.can_edit_integration_settings || false,
        can_edit_security_settings: data.can_edit_security_settings || false,
        can_edit_billing_settings: data.can_edit_billing_settings || false,
        can_manage_employee_settings: data.can_manage_employee_settings || false,
        customer_access_scope: (data.customer_access_scope as 'assigned_only' | 'team' | 'department' | 'all_company') || 'assigned_only',
        can_access_customer_pii: data.can_access_customer_pii || false,
        can_export_customer_data: data.can_export_customer_data || false,
        can_access_financial_automations: data.can_access_financial_automations || false,
        can_modify_pricing_automations: data.can_modify_pricing_automations || false,
        requires_financial_approval: data.requires_financial_approval !== false,
        can_use_ai_agent: (data as any).can_use_ai_agent !== false,
        can_create_ai_workflows: (data as any).can_create_ai_workflows !== false
      } : getDefaultPrivileges();

      setExistingPrivilegeId(data?.id || null);
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
        title: "Info",
        description: "Privileges will be saved when the employee is created",
        variant: "default"
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

      let error;
      
      if (existingPrivilegeId) {
        const { error: updateError } = await supabase
          .from('employee_privileges')
          .update(privilegeData)
          .eq('id', existingPrivilegeId);
        error = updateError;
      } else {
        const { data, error: insertError } = await supabase
          .from('employee_privileges')
          .insert([privilegeData])
          .select('id')
          .single();
        
        if (data) {
          setExistingPrivilegeId(data.id);
        }
        error = insertError;
      }

      if (error) throw error;

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
        description: error.message || "Failed to save employee privileges",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = () => {
    return JSON.stringify(privileges) !== JSON.stringify(originalPrivileges);
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading enhanced privileges...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Shield className="h-5 w-5 text-primary" />
            Enhanced Security Privileges
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure granular access controls for automation, settings, and data access
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <ScopeConfiguration 
            privileges={privileges}
            onPrivilegeChange={handlePrivilegeChange}
          />

          {privilegeGroups.map((group) => (
            <PrivilegeGroup
              key={group.title}
              group={{
                ...group,
                icon: <group.icon className="h-5 w-5" />
              }}
              privileges={privileges}
              onPrivilegeChange={handlePrivilegeChange}
            />
          ))}

          <FinancialApprovalControl
            checked={privileges.requires_financial_approval}
            onChange={handlePrivilegeChange}
          />

          <ChangeReasonInput
            value={changeReason}
            onChange={setChangeReason}
            hasChanges={hasChanges()}
          />

          <div className="flex justify-end pt-4 border-t border-border">
            <Button
              onClick={savePrivileges}
              disabled={saving || !hasChanges()}
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
