
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { useRealtimeDataSync } from './realtime-sync/useRealtimeDataSync';
import DataSyncRuleCard from './realtime-sync/DataSyncRuleCard';
import DataSyncRuleForm from './realtime-sync/DataSyncRuleForm';
import DataSyncEmptyState from './realtime-sync/DataSyncEmptyState';
import { NewDataSyncRule } from './realtime-sync/types';

const RealtimeDataSync = () => {
  const {
    syncRules,
    createSyncRule,
    toggleSyncRule,
    deleteSyncRule,
    triggerManualSync
  } = useRealtimeDataSync();

  const [isCreating, setIsCreating] = useState(false);
  const [newRule, setNewRule] = useState<NewDataSyncRule>({
    name: '',
    sourceSystem: '',
    targetSystem: '',
    dataType: '',
    syncDirection: 'bidirectional',
    frequency: 'real-time'
  });

  const handleCreate = () => {
    const success = createSyncRule(newRule);
    if (success) {
      setNewRule({
        name: '',
        sourceSystem: '',
        targetSystem: '',
        dataType: '',
        syncDirection: 'bidirectional',
        frequency: 'real-time'
      });
      setIsCreating(false);
    }
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
          <DataSyncRuleForm
            isOpen={isCreating}
            onClose={() => setIsCreating(false)}
            newRule={newRule}
            onRuleChange={setNewRule}
            onCreate={handleCreate}
          />
        </Dialog>
      </div>

      <div className="grid gap-4">
        {syncRules.map((rule) => (
          <DataSyncRuleCard
            key={rule.id}
            rule={rule}
            onToggle={toggleSyncRule}
            onDelete={deleteSyncRule}
            onManualSync={triggerManualSync}
          />
        ))}
      </div>

      {syncRules.length === 0 && (
        <DataSyncEmptyState onCreateFirst={() => setIsCreating(true)} />
      )}
    </div>
  );
};

export default RealtimeDataSync;
