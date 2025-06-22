
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import ZapierConnectionCard from './zapier/ZapierConnectionCard';
import ZapierConnectionForm from './zapier/ZapierConnectionForm';
import ZapierEmptyState from './zapier/ZapierEmptyState';
import { useZapierConnections } from './zapier/useZapierConnections';
import { NewZapierConnection } from './zapier/types';

const ZapierIntegrations = () => {
  const {
    connections,
    testWebhook,
    createConnection,
    toggleConnection,
    deleteConnection
  } = useZapierConnections();

  const [isCreating, setIsCreating] = useState(false);
  const [newConnection, setNewConnection] = useState<NewZapierConnection>({
    name: '',
    platform: 'zapier',
    webhookUrl: '',
    apps: []
  });

  const handleCreate = () => {
    const success = createConnection(newConnection);
    if (success) {
      setNewConnection({ name: '', platform: 'zapier', webhookUrl: '', apps: [] });
      setIsCreating(false);
    }
  };

  const handleCreateFirst = () => {
    setIsCreating(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Zapier, Make & N8N Integrations</h3>
          <p className="text-sm text-muted-foreground">
            Connect with 1000+ apps using popular automation platforms
          </p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </DialogTrigger>
          <ZapierConnectionForm
            isOpen={isCreating}
            onClose={() => setIsCreating(false)}
            newConnection={newConnection}
            onConnectionChange={setNewConnection}
            onCreate={handleCreate}
          />
        </Dialog>
      </div>

      <div className="grid gap-4">
        {connections.map((connection) => (
          <ZapierConnectionCard
            key={connection.id}
            connection={connection}
            onToggle={toggleConnection}
            onDelete={deleteConnection}
            onTest={testWebhook}
          />
        ))}
      </div>

      {connections.length === 0 && (
        <ZapierEmptyState onCreateFirst={handleCreateFirst} />
      )}
    </div>
  );
};

export default ZapierIntegrations;
