
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BatchQueuesCardProps {
  batchQueueSizes: { [key: string]: number };
}

const BatchQueuesCard = ({ batchQueueSizes }: BatchQueuesCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Queues</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(batchQueueSizes).map(([type, count]) => {
            const queueCount = Number(count);
            return (
              <div key={type} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{type}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {queueCount} operations queued
                  </span>
                </div>
                <div className="text-sm font-medium">
                  {queueCount > 0 ? (
                    <span className="text-orange-500">Processing...</span>
                  ) : (
                    <span className="text-green-500">Idle</span>
                  )}
                </div>
              </div>
            );
          })}
          
          {Object.keys(batchQueueSizes).length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No batch operations in queue
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BatchQueuesCard;
