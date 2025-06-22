
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface SocialMonitoringEmptyStateProps {
  onCreateFirst: () => void;
}

const SocialMonitoringEmptyState: React.FC<SocialMonitoringEmptyStateProps> = ({ onCreateFirst }) => {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Social Monitors</h3>
        <p className="text-muted-foreground mb-4">
          Create your first social media monitor to track brand mentions
        </p>
        <Button onClick={onCreateFirst}>
          Create Your First Monitor
        </Button>
      </CardContent>
    </Card>
  );
};

export default SocialMonitoringEmptyState;
