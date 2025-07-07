
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Layers } from "lucide-react";

interface BatchQueuesCardProps {
  batchQueueSizes: Record<string, number>;
}

const BatchQueuesCard = ({ batchQueueSizes }: BatchQueuesCardProps) => {
  const maxQueueSize = 20; // Define max queue size for progress calculation

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Batch Queue Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(batchQueueSizes).map(([queueName, size]) => (
            <div key={queueName} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium capitalize">
                  {queueName.replace('-', ' ')}
                </span>
                <Badge variant={size > 10 ? 'destructive' : 'secondary'}>
                  {size} items
                </Badge>
              </div>
              <Progress 
                value={(size / maxQueueSize) * 100} 
                className="h-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BatchQueuesCard;
