
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Shield, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface PrivilegesManagerProps {
  employeeId?: string;
}

interface Privileges {
  can_view_customers: boolean;
  can_edit_customers: boolean;
  can_delete_customers: boolean;
  can_view_quotes: boolean;
  can_create_quotes: boolean;
  can_edit_quotes: boolean;
  can_delete_quotes: boolean;
  can_view_analytics: boolean;
  can_manage_employees: boolean;
  can_manage_company_settings: boolean;
  can_update_customer_status_onsite: boolean;
}

const PrivilegesManager = ({ employeeId }: PrivilegesManagerProps) => {
  const [privileges, setPrivileges] = useState<Privileges>({
    can_view_customers: false,
    can_edit_customers: false,
    can_delete_customers: false,
    can_view_quotes: false,
    can_create_quotes: false,
    can_edit_quotes: false,
    can_delete_quotes: false,
    can_view_analytics: false,
    can_manage_employees: false,
    can_manage_company_settings: false,
    can_update_customer_status_onsite: false
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

      if (data) {
        setPrivileges({
          can_view_customers: data.can_view_customers || false,
          can_edit_customers: data.can_edit_customers || false,
          can_delete_customers: data.can_delete_customers || false,
          can_view_quotes: data.can_view_quotes || false,
          can_create_quotes: data.can_create_quotes || false,
          can_edit_quotes: data.can_edit_quotes || false,
          can_delete_quotes: data.can_delete_quotes || false,
          can_view_analytics: data.can_view_analytics || false,
          can_manage_employees: data.can_manage_employees || false,
          can_manage_company_settings: data.can_manage_company_settings || false,
          can_update_customer_status_onsite: data.can_update_customer_status_onsite || false
        });
      }
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

  const handlePrivilegeChange = (privilege: keyof Privileges, value: boolean) => {
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
        privilege_name: 'standard_privileges',
        privilege_description: 'Standard employee privileges',
        ...privileges
      };

      const { error } = await supabase
        .from('employee_privileges')
        .upsert([privilegeData], {
          onConflict: 'employee_id'
        });

      if (error) throw error;

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

  const privilegeGroups = [
    {
      title: "Customer Management",
      privileges: [
        { key: 'can_view_customers', label: 'View Customers', description: 'Access customer information' },
        { key: 'can_edit_customers', label: 'Edit Customers', description: 'Modify customer details' },
        { key: 'can_delete_customers', label: 'Delete Customers', description: 'Remove customers from system' }
      ]
    },
    {
      title: "On-Site Operations",
      privileges: [
        { key: 'can_update_customer_status_onsite', label: 'Update Customer Status (Mobile)', description: 'Update customer status after completing on-site jobs using mobile device' }
      ]
    },
    {
      title: "Quotes & Invoices",
      privileges: [
        { key: 'can_view_quotes', label: 'View Quotes', description: 'Access quotes and invoices' },
        { key: 'can_create_quotes', label: 'Create Quotes', description: 'Generate new quotes and invoices' },
        { key: 'can_edit_quotes', label: 'Edit Quotes', description: 'Modify existing quotes and invoices' },
        { key: 'can_delete_quotes', label: 'Delete Quotes', description: 'Remove quotes and invoices' }
      ]
    },
    {
      title: "Analytics & Management",
      privileges: [
        { key: 'can_view_analytics', label: 'View Analytics', description: 'Access reports and analytics' },
        { key: 'can_manage_employees', label: 'Manage Employees', description: 'Add, edit, and manage team members' },
        { key: 'can_manage_company_settings', label: 'Company Settings', description: 'Modify company-wide settings' }
      ]
    }
  ];

  if (loading) {
    return <div className="text-center py-8 text-quikle-slate">Loading privileges...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-quikle-charcoal">
          <Shield className="h-5 w-5 text-quikle-primary" />
          Employee Privileges
        </CardTitle>
        <p className="text-sm text-quikle-slate">
          Configure what this employee can access and manage in the system
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {privilegeGroups.map((group) => (
          <div key={group.title} className="space-y-4">
            <h4 className="font-semibold text-quikle-charcoal border-b border-quikle-silver/30 pb-2">
              {group.title}
            </h4>
            <div className="grid gap-4">
              {group.privileges.map((privilege) => (
                <div key={privilege.key} className="flex items-center justify-between space-x-4 p-3 rounded-lg bg-quikle-crystal/30">
                  <div className="flex-1">
                    <Label htmlFor={privilege.key} className="text-quikle-charcoal font-medium">
                      {privilege.label}
                    </Label>
                    <p className="text-sm text-quikle-slate mt-1">{privilege.description}</p>
                  </div>
                  <Switch
                    id={privilege.key}
                    checked={privileges[privilege.key as keyof Privileges]}
                    onCheckedChange={(value) => handlePrivilegeChange(privilege.key as keyof Privileges, value)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex justify-end pt-4 border-t border-quikle-silver">
          <Button
            onClick={savePrivileges}
            disabled={saving || !employeeId}
            className="bg-quikle-primary hover:bg-quikle-secondary text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Privileges'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivilegesManager;
