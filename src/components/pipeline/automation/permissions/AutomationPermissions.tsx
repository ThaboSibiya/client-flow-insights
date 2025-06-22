
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Plus, X } from 'lucide-react';
import { useEmployeePrivileges } from '@/hooks/useEmployeePrivileges';

interface AutomationPermission {
  id: string;
  automationId: string;
  userId: string;
  userName: string;
  role: 'viewer' | 'editor' | 'admin';
  canExecute: boolean;
  canModify: boolean;
  canDelete: boolean;
}

interface AutomationPermissionsProps {
  automationId: string;
  onPermissionChange?: (permissions: AutomationPermission[]) => void;
}

const AutomationPermissions: React.FC<AutomationPermissionsProps> = ({
  automationId,
  onPermissionChange
}) => {
  const { hasPrivilege } = useEmployeePrivileges();
  const [permissions, setPermissions] = useState<AutomationPermission[]>([
    {
      id: '1',
      automationId,
      userId: 'user1',
      userName: 'John Doe',
      role: 'editor',
      canExecute: true,
      canModify: true,
      canDelete: false
    },
    {
      id: '2',
      automationId,
      userId: 'user2',
      userName: 'Jane Smith',
      role: 'viewer',
      canExecute: false,
      canModify: false,
      canDelete: false
    }
  ]);

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserRole, setNewUserRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');

  const canManagePermissions = hasPrivilege('can_manage_employees');

  if (!canManagePermissions) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            You don't have permission to manage automation permissions.
          </p>
        </CardContent>
      </Card>
    );
  }

  const updatePermission = (id: string, updates: Partial<AutomationPermission>) => {
    const updated = permissions.map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    setPermissions(updated);
    onPermissionChange?.(updated);
  };

  const removePermission = (id: string) => {
    const updated = permissions.filter(p => p.id !== id);
    setPermissions(updated);
    onPermissionChange?.(updated);
  };

  const addUser = () => {
    const newPermission: AutomationPermission = {
      id: Date.now().toString(),
      automationId,
      userId: `user_${Date.now()}`,
      userName: 'New User',
      role: newUserRole,
      canExecute: newUserRole !== 'viewer',
      canModify: newUserRole === 'editor' || newUserRole === 'admin',
      canDelete: newUserRole === 'admin'
    };

    const updated = [...permissions, newPermission];
    setPermissions(updated);
    onPermissionChange?.(updated);
    setIsAddingUser(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
            Manage who can view, modify, and execute this automation
          </p>
          <Button
            size="sm"
            onClick={() => setIsAddingUser(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>

        {isAddingUser && (
          <Card className="border-dashed">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Select value={newUserRole} onValueChange={(value: any) => setNewUserRole(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={addUser}>Add</Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setIsAddingUser(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {permissions.map((permission) => (
            <Card key={permission.id} className="border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{permission.userName}</p>
                      <Badge className={`text-xs ${getRoleColor(permission.role)}`}>
                        {permission.role}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removePermission(permission.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={permission.canExecute}
                      onCheckedChange={(checked) => 
                        updatePermission(permission.id, { canExecute: checked })
                      }
                    />
                    <Label className="text-sm">Execute</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={permission.canModify}
                      onCheckedChange={(checked) => 
                        updatePermission(permission.id, { canModify: checked })
                      }
                    />
                    <Label className="text-sm">Modify</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={permission.canDelete}
                      onCheckedChange={(checked) => 
                        updatePermission(permission.id, { canDelete: checked })
                      }
                    />
                    <Label className="text-sm">Delete</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AutomationPermissions;
