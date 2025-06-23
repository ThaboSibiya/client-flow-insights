
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Shield, Users, Plus, X, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getAutomationPermissions, grantAutomationPermission, AutomationPermission } from '@/services/enhancedSecurityService';

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

  const getPermissionLevelColor = (level: string) => {
    switch (level) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'edit': return 'bg-blue-100 text-blue-800';
      case 'execute': return 'bg-green-100 text-green-800';
      case 'view': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
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
          <Card className="border-dashed">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Automation ID</Label>
                  <Input
                    placeholder="automation-123"
                    value={newPermission.automation_id}
                    onChange={(e) => setNewPermission(prev => ({ ...prev, automation_id: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Permission Level</Label>
                  <Select 
                    value={newPermission.permission_level} 
                    onValueChange={(value: any) => setNewPermission(prev => ({ ...prev, permission_level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">View Only</SelectItem>
                      <SelectItem value="execute">Execute</SelectItem>
                      <SelectItem value="edit">Edit</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Expires At (Optional)</Label>
                  <Input
                    type="datetime-local"
                    value={newPermission.expires_at}
                    onChange={(e) => setNewPermission(prev => ({ ...prev, expires_at: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddPermission}>Grant</Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setIsAddingPermission(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {permissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No specific automation permissions granted</p>
              <p className="text-sm">Employee will use general automation privileges</p>
            </div>
          ) : (
            permissions.map((permission) => (
              <Card key={permission.id} className={`border ${isExpired(permission.expires_at) ? 'border-red-200 bg-red-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{permission.automation_id}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getPermissionLevelColor(permission.permission_level)}>
                            {permission.permission_level}
                          </Badge>
                          {permission.expires_at && (
                            <Badge variant="outline" className={isExpired(permission.expires_at) ? 'border-red-300 text-red-700' : 'border-gray-300'}>
                              <Clock className="h-3 w-3 mr-1" />
                              {isExpired(permission.expires_at) ? 'Expired' : 'Expires'}: {new Date(permission.expires_at).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Granted: {new Date(permission.granted_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AutomationSecurityManager;
