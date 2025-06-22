
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import CustomApiTriggerCard from './custom-api/CustomApiTriggerCard';
import CustomApiTriggerForm from './custom-api/CustomApiTriggerForm';
import CustomApiEmptyState from './custom-api/CustomApiEmptyState';
import { useCustomApiTriggers } from './custom-api/useCustomApiTriggers';
import { NewCustomApiTrigger } from './custom-api/types';

const CustomApiTriggers = () => {
  const {
    triggers,
    generateEndpoint,
    createTrigger,
    toggleTrigger,
    deleteTrigger,
    copyEndpoint,
    testTrigger
  } = useCustomApiTriggers();

  const [isCreating, setIsCreating] = useState(false);
  const [newTrigger, setNewTrigger] = useState<NewCustomApiTrigger>({
    name: '',
    endpoint: '',
    method: 'POST',
    authType: 'bearer',
    description: '',
    samplePayload: ''
  });

  const handleCreate = () => {
    const success = createTrigger(newTrigger);
    if (success) {
      setNewTrigger({
        name: '',
        endpoint: '',
        method: 'POST',
        authType: 'bearer',
        description: '',
        samplePayload: ''
      });
      setIsCreating(false);
    }
  };

  const handleGenerateEndpoint = () => {
    setNewTrigger({ ...newTrigger, endpoint: generateEndpoint() });
  };

  const handleCreateFirst = () => {
    setIsCreating(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Custom API Triggers</h3>
          <p className="text-sm text-muted-foreground">
            Create specialized webhook endpoints for custom integrations
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create API Trigger
            </Button>
          </DialogTrigger>
          <CustomApiTriggerForm
            isOpen={isCreating}
            onClose={() => setIsCreating(false)}
            newTrigger={newTrigger}
            onTriggerChange={setNewTrigger}
            onCreate={handleCreate}
            onGenerateEndpoint={handleGenerateEndpoint}
          />
        </Dialog>
      </div>

      <div className="grid gap-4">
        {triggers.map((trigger) => (
          <CustomApiTriggerCard
            key={trigger.id}
            trigger={trigger}
            onToggle={toggleTrigger}
            onDelete={deleteTrigger}
            onTest={testTrigger}
            onCopyEndpoint={copyEndpoint}
          />
        ))}
      </div>

      {triggers.length === 0 && (
        <CustomApiEmptyState onCreateFirst={handleCreateFirst} />
      )}
    </div>
  );
};

export default CustomApiTriggers;
