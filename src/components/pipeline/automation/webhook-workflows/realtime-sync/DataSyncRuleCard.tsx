
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { GitBranch, RefreshCw, Trash2, Activity } from 'lucide-react';
import { DataSyncRule } from './types';

interface DataSyncRuleCardProps {
  rule: DataSyncRule;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onManualSync: (rule: DataSyncRule) => void;
}

const DataSyncRuleCard: React.FC<DataSyncRuleCardProps> = ({
  rule,
  onToggle,
  onDelete,
  onManualSync
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'syncing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <Activity className="h-4 w-4 text-green-600" />;
      case 'error': return <Activity className="h-4 w-4 text-red-600" />;
      case 'syncing': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GitBranch className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle className="text-base">{rule.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {rule.sourceSystem} → {rule.targetSystem} • {rule.syncCount} syncs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(rule.status)}
            <Badge variant={rule.isActive ? 'default' : 'secondary'}>
              {rule.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Switch
              checked={rule.isActive}
              onCheckedChange={() => onToggle(rule.id)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-medium">Data Type</Label>
            <p className="text-sm">{rule.dataType}</p>
          </div>
          <div>
            <Label className="text-xs font-medium">Direction</Label>
            <Badge variant="outline" className="text-xs">
              {rule.syncDirection}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-medium">Frequency</Label>
            <p className="text-sm">{rule.frequency}</p>
          </div>
          <div>
            <Label className="text-xs font-medium">Status</Label>
            <p className={`text-sm font-medium ${getStatusColor(rule.status)}`}>
              {rule.status}
            </p>
          </div>
        </div>

        {rule.lastSync && (
          <p className="text-xs text-muted-foreground">
            Last sync: {new Date(rule.lastSync).toLocaleString()}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onManualSync(rule)}
            disabled={rule.status === 'syncing'}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${rule.status === 'syncing' ? 'animate-spin' : ''}`} />
            Manual Sync
          </Button>
          <Button 
            size="sm" 
            variant="destructive"
            onClick={() => onDelete(rule.id)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataSyncRuleCard;
