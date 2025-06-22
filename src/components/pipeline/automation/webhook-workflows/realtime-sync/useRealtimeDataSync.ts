
import { useState } from 'react';
import { toast } from 'sonner';
import { DataSyncRule, NewDataSyncRule } from './types';

export const useRealtimeDataSync = () => {
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

  const createSyncRule = (newRule: NewDataSyncRule) => {
    if (!newRule.name || !newRule.sourceSystem || !newRule.targetSystem) {
      toast.error("Please fill in all required fields");
      return false;
    }

    const rule: DataSyncRule = {
      id: Date.now().toString(),
      ...newRule,
      isActive: true,
      syncCount: 0,
      status: 'healthy'
    };

    setSyncRules([...syncRules, rule]);
    toast.success("New real-time data sync rule has been created");
    return true;
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

  return {
    syncRules,
    createSyncRule,
    toggleSyncRule,
    deleteSyncRule,
    triggerManualSync
  };
};
