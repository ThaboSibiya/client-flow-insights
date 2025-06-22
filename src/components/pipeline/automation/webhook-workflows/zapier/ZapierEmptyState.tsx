
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

interface ZapierEmptyStateProps {
  onCreateFirst: () => void;
}

const ZapierEmptyState: React.FC<ZapierEmptyStateProps> = ({ onCreateFirst }) => {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Integrations Yet</h3>
        <p className="text-muted-foreground mb-4">
          Connect your first automation platform to start building workflows
        </p>
        <Button onClick={onCreateFirst}>
          Create Your First Integration
        </Button>
      </CardContent>
    </Card>
  );
};

export default ZapierEmptyState;
