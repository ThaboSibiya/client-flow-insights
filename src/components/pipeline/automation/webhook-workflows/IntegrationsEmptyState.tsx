
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Webhook, Zap } from 'lucide-react';

interface IntegrationsEmptyStateProps {
  onCreateTrigger: () => void;
  onCreateWebhook: () => void;
}

const IntegrationsEmptyState: React.FC<IntegrationsEmptyStateProps> = ({
  onCreateTrigger,
  onCreateWebhook,
}) => {
  return (
    <Card>
      <CardContent className="text-center py-16 px-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Webhook className="h-5 w-5 text-primary" />
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-1">No Integrations Yet</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
          Create API endpoints for external apps, or connect to automation platforms like Zapier, Make, and n8n.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={onCreateWebhook}>
            <Zap className="h-4 w-4 mr-2" />
            Add Webhook
          </Button>
          <Button onClick={onCreateTrigger}>
            <Webhook className="h-4 w-4 mr-2" />
            Create API Endpoint
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationsEmptyState;
