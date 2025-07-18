
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap } from "lucide-react";

interface QueueHealthCardProps {
  stats: {
    totalJobs: number;
    runningJobs: number;
    failedJobs: number;
  };
}

const calculateQueueHealth = (stats: QueueHealthCardProps['stats']) => {
  const { totalJobs, runningJobs, failedJobs } = stats;
  
  if (totalJobs === 0) return { percentage: 100, status: 'healthy' };
  
  const healthyPercentage = ((totalJobs - failedJobs) / totalJobs) * 100;
  const isProcessing = runningJobs > 0;
  
  if (healthyPercentage > 90 && isProcessing) return { percentage: healthyPercentage, status: 'excellent' };
  if (healthyPercentage > 75) return { percentage: healthyPercentage, status: 'good' };
  if (healthyPercentage > 50) return { percentage: healthyPercentage, status: 'fair' };
  return { percentage: healthyPercentage, status: 'poor' };
};


const QueueHealthCard = ({ stats }: QueueHealthCardProps) => {
  const queueHealth = calculateQueueHealth(stats);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-500" />
          Queue Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Health</span>
            <Badge 
              variant={queueHealth.status === 'excellent' ? 'default' : 
                      queueHealth.status === 'good' ? 'secondary' : 
                      queueHealth.status === 'fair' ? 'outline' : 'destructive'}
            >
              {queueHealth.status}
            </Badge>
          </div>
          <Progress value={queueHealth.percentage} className="h-2" />
          <div className="text-xs text-muted-foreground">
            {queueHealth.percentage.toFixed(1)}% success rate
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QueueHealthCard;
