import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Zap, Webhook, GitBranch, Loader2 } from 'lucide-react';

interface IntegrationEmptyStateProps {
  type: 'webhooks' | 'api-triggers' | 'sync-rules';
  onCreateFirst: () => void;
  isLoading?: boolean;
}

const emptyStateConfig = {
  webhooks: {
    icon: Zap,
    title: 'No webhook connections yet',
    description: 'Connect to Zapier, Make, or N8N to automate workflows with 1000+ apps.',
    buttonText: 'Add Webhook Connection'
  },
  'api-triggers': {
    icon: Webhook,
    title: 'No API triggers created',
    description: 'Create custom webhook endpoints to receive data from external systems.',
    buttonText: 'Create API Trigger'
  },
  'sync-rules': {
    icon: GitBranch,
    title: 'No sync rules configured',
    description: 'Set up data synchronization between your systems.',
    buttonText: 'Add Sync Rule'
  }
};

const IntegrationEmptyState: React.FC<IntegrationEmptyStateProps> = ({
  type,
  onCreateFirst,
  isLoading
}) => {
  const config = emptyStateConfig[type];
  const Icon = config.icon;

  if (isLoading) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
          {config.description}
        </p>
        <Button onClick={onCreateFirst}>
          <Plus className="h-4 w-4 mr-2" />
          {config.buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default IntegrationEmptyState;
