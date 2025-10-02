
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code } from 'lucide-react';

interface CustomApiEmptyStateProps {
  onCreateFirst: () => void;
}

const CustomApiEmptyState: React.FC<CustomApiEmptyStateProps> = ({ onCreateFirst }) => {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <Code className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Custom API Triggers Yet</h3>
        <p className="text-muted-foreground mb-4">
          Create custom webhooks powered by Quikle Innovation Suite to integrate with any external system
        </p>
        <Button onClick={onCreateFirst}>
          Create Your First Trigger
        </Button>
      </CardContent>
    </Card>
  );
};

export default CustomApiEmptyState;
