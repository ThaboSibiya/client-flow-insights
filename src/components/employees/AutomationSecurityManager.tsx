
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getAutomationPermissions, grantAutomationPermission } from '@/services/automationPermissionService';
import { AutomationPermission } from '@/types/enhancedSecurity';
import PermissionForm from './automation-security/PermissionForm';
import PermissionCard from './automation-security/PermissionCard';
import EmptyPermissionsState from './automation-security/EmptyPermissionsState';

interface AutomationSecurityManagerProps {
  employeeId: string;
}

const AutomationSecurityManager: React.FC<AutomationSecurityManagerProps> = ({ employeeId }) => {
  const [permissions, setPermissions] = useState<AutomationPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingPermission, setIsAddingPermission] = useState(false);
  const [newPermission, setNewPermission] = useState({
    automation_id: '',
    permission_level: 'view' as 'view' | 'execute' | 'edit' | 'admin',
    expires_at: ''
  });

  useEffect(() => {
    loadPermissions();
  }, [employeeId]);

  const loadPermissions = async () => {
    if (!employeeId) return;
    
    setLoading(true);
    try {
      const data = await getAutomationPermissions(employeeId);
      setPermissions(data);
    } catch (error) {
      console.error('Error loading automation permissions:', error);
      toast({
        title: "Error",
        description: "Failed to load automation permissions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (field: string, value: string) => {
    setNewPermission(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPermission = async () => {
    if (!newPermission.automation_id.trim()) {
      toast({
        title: "Error",
        description: "Please enter an automation ID",
        variant: "destructive"
      });
      return;
    }

    const success = await grantAutomationPermission(
      newPermission.automation_id,
      employeeId,
      newPermission.permission_level,
      newPermission.expires_at || undefined
    );

    if (success) {
      toast({
        title: "Success",
        description: "Automation permission granted successfully"
      });
      setNewPermission({ automation_id: '', permission_level: 'view', expires_at: '' });
      setIsAddingPermission(false);
      loadPermissions();
    }
  };

  const handleCancel = () => {
    setIsAddingPermission(false);
    setNewPermission({ automation_id: '', permission_level: 'view', expires_at: '' });
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading automation permissions...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Automation Permissions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Manage specific automation access for this employee
          </p>
          <Button
            size="sm"
            onClick={() => setIsAddingPermission(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Grant Permission
          </Button>
        </div>

        {isAddingPermission && (
          <PermissionForm
            newPermission={newPermission}
            onPermissionChange={handlePermissionChange}
            onAddPermission={handleAddPermission}
            onCancel={handleCancel}
          />
        )}

        <div className="space-y-3">
          {permissions.length === 0 ? (
            <EmptyPermissionsState />
          ) : (
            permissions.map((permission) => (
              <PermissionCard key={permission.id} permission={permission} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AutomationSecurityManager;
