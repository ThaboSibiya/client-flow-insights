
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PermissionFormProps {
  newPermission: {
    automation_id: string;
    permission_level: 'view' | 'execute' | 'edit' | 'admin';
    expires_at: string;
  };
  onPermissionChange: (field: string, value: string) => void;
  onAddPermission: () => void;
  onCancel: () => void;
}

const PermissionForm: React.FC<PermissionFormProps> = ({
  newPermission,
  onPermissionChange,
  onAddPermission,
  onCancel
}) => {
  return (
    <Card className="border-dashed">
      <CardContent className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-sm font-medium">Automation ID</Label>
            <Input
              placeholder="automation-123"
              value={newPermission.automation_id}
              onChange={(e) => onPermissionChange('automation_id', e.target.value)}
            />
          </div>
          <div>
            <Label className="text-sm font-medium">Permission Level</Label>
            <Select 
              value={newPermission.permission_level} 
              onValueChange={(value) => onPermissionChange('permission_level', value)}
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
              onChange={(e) => onPermissionChange('expires_at', e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={onAddPermission}>Grant</Button>
          <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionForm;
