
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock } from 'lucide-react';
import { AutomationPermission } from '@/types/enhancedSecurity';

interface PermissionCardProps {
  permission: AutomationPermission;
}

const PermissionCard: React.FC<PermissionCardProps> = ({ permission }) => {
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

  return (
    <Card className={`border ${isExpired(permission.expires_at) ? 'border-red-200 bg-red-50' : ''}`}>
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
  );
};

export default PermissionCard;
