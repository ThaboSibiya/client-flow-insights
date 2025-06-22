
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GitBranch, Database, RefreshCw, Plus, Trash2, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface DataSyncRule {
  id: string;
  name: string;
  sourceSystem: string;
  targetSystem: string;
  dataType: string;
  syncDirection: 'bidirectional' | 'push' | 'pull';
  isActive: boolean;
  frequency: string;
  lastSync?: string;
  syncCount: number;
  status: 'healthy' | 'error' | 'syncing';
}

const RealtimeDataSync = () => {
  const [syncRules, setSyncRules] = useState<DataSyncRule[]>([
    {
      id: '1',
      name: 'Customer Data Sync',
      sourceSystem: 'Quikle CRM',
      targetSystem: 'Salesforce',
      dataType: 'customers',
      syncDirection: 'bidirectional',
      isActive: true,
      frequency: 'real-time',
      lastSync: '2024-01-22T10:30:00Z',
      syncCount: 1247,
      status: 'healthy'
    },
    {
      id: '2',
      name: 'Ticket Status Updates',
      sourceSystem: 'Quikle Tickets',
      targetSystem: 'Slack',
      dataType: 'tickets',
      syncDirection: 'push',
      isActive: true,
      frequency: 'real-time',
      lastSync: '2024-01-22T10:25:00Z',
      syncCount: 89,
      status: 'healthy'
    },
    {
      id: '3',
      name: 'Inventory Sync',
      sourceSystem: 'Shopify',
      targetSystem: 'Quikle Products',
      dataType: 'products',
      syncDirection: 'pull',
      isActive: false,
      frequency: 'hourly',
      syncCount: 0,
      status: 'error'
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    sourceSystem: '',
    targetSystem: '',
    dataType: '',
    syncDirection: 'bidirectional' as 'bidirectional' | 'push' | 'pull',
    frequency: 'real-time'
  });

  const systems = [
    'Quikle CRM', 'Quikle Tickets', 'Quikle Products',
    'Salesforce', 'HubSpot', 'Slack', 'Microsoft Teams',
    'Shopify', 'WooCommerce', 'Google Sheets', 'Airtable'
  ];

  const dataTypes = [
    'customers', 'tickets', 'products', 'orders', 'contacts',
    'leads', 'tasks', '﻿events', 'files', 'messages'
  ];

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

  const createSyncRule = () => {
    if (!newRule.name || !newRule.sourceSystem || !newRule.targetSystem) {
      toast.error("Please fill in all required fields");
      return;
    }

    const rule: DataSyncRule = {
      id: Date.now().toString(),
      ...newRule,
      isActive: true,
      syncCount: 0,
      status: 'healthy'
    };

    setSyncRules([...syncRules, rule]);
    setNewRule({
      name: '',
      sourceSystem: '',
      targetSystem: '',
      dataType: '',
      syncDirection: 'bidirectional',
      frequency: 'real-time'
    });
    setIsCreating(false);
    
    toast.success("New real-time data sync rule has been created");
  };

  const toggleSyncRule = (id: string) => {
    setSyncRules(syncRules.map(rule => 
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    ));
  };

  const deleteSyncRule = (id: string) => {
    setSyncRules(syncRules.filter(rule => rule.id !== id));
    toast.success("Data sync rule has been removed");
  };

  const triggerManualSync = (rule: DataSyncRule) => {
    setSyncRules(syncRules.map(r => 
      r.id === rule.id ? { 
        ...r, 
        status: 'syncing',
        lastSync: new Date().toISOString(),
        syncCount: r.syncCount + 1
      } : r
    ));

    setTimeout(() => {
      setSyncRules(current => current.map(r => 
        r.id === rule.id ? { ...r, status: 'healthy' } : r
      ));
    }, 2000);

    toast.success(`Syncing ${rule.dataType} between ${rule.sourceSystem} and ${rule.targetSystem}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Real-time Data Synchronization</h3>
          <p className="text-sm text-muted-foreground">
            Keep your systems in sync with real-time data flows
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Sync Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Data Sync Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Rule Name</Label>
                <Input
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="e.g., Customer Data Sync"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Source System</Label>
                  <Select 
                    value={newRule.sourceSystem} 
                    onValueChange={(value) => setNewRule({ ...newRule, sourceSystem: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source..." />
                    </SelectTrigger>
                    <SelectContent>
                      {systems.map(system => (
                        <SelectItem key={system} value={system}>{system}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Target System</Label>
                  <Select 
                    value={newRule.targetSystem} 
                    onValueChange={(value) => setNewRule({ ...newRule, targetSystem: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target..." />
                    </SelectTrigger>
                    <SelectContent>
                      {systems.map(system => (
                        <SelectItem key={system} value={system}>{system}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Type</Label>
                  <Select 
                    value={newRule.dataType} 
                    onValueChange={(value) => setNewRule({ ...newRule, dataType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select data type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {dataTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sync Direction</Label>
                  <Select 
                    value={newRule.syncDirection} 
                    onValueChange={(value) => 
                      setNewRule({ ...newRule, syncDirection: value as 'bidirectional' | 'push' | 'pull' })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bidirectional">Bidirectional</SelectItem>
                      <SelectItem value="push">Push Only</SelectItem>
                      <SelectItem value="pull">Pull Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Sync Frequency</Label>
                <Select 
                  value={newRule.frequency} 
                  onValueChange={(value) => setNewRule({ ...newRule, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="real-time">Real-time</SelectItem>
                    <SelectItem value="5min">Every 5 minutes</SelectItem>
                    <SelectItem value="15min">Every 15 minutes</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={createSyncRule}>
                  Create Sync Rule
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {syncRules.map((rule) => (
          <Card key={rule.id}>
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
                    onCheckedChange={() => toggleSyncRule(rule.id)}
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
                  onClick={() => triggerManualSync(rule)}
                  disabled={rule.status === 'syncing'}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${rule.status === 'syncing' ? 'animate-spin' : ''}`} />
                  Manual Sync
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => deleteSyncRule(rule.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {syncRules.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Sync Rules</h3>
            <p className="text-muted-foreground mb-4">
              Create your first data sync rule to keep systems synchronized
            </p>
            <Button onClick={() => setIsCreating(true)}>
              Create Your First Sync Rule
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealtimeDataSync;
