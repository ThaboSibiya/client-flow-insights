
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';

interface DataSyncEmptyStateProps {
  onCreateFirst: () => void;
}

const DataSyncEmptyState: React.FC<DataSyncEmptyStateProps> = ({ onCreateFirst }) => {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Sync Rules</h3>
        <p className="text-muted-foreground mb-4">
          Create your first data sync rule to keep systems synchronized
        </p>
        <Button onClick={onCreateFirst}>
          Create Your First Sync Rule
        </Button>
      </CardContent>
    </Card>
  );
};

export default DataSyncEmptyState;
