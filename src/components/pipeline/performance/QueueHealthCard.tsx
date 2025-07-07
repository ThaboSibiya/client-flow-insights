
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity } from "lucide-react";

interface QueueHealthCardProps {
  stats: any;
}

const QueueHealthCard = ({ stats }: QueueHealthCardProps) => {
  const successRate = ((stats.successfulExecutions / stats.totalExecutions) * 100);
  
  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Queue Health Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">System Status</p>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-3 h-3 rounded-full ${getHealthColor(stats.systemHealth)}`} />
              <Badge variant={stats.systemHealth === 'healthy' ? 'default' : 'destructive'}>
                {stats.systemHealth}
              </Badge>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Success Rate</p>
            <div className="mt-1">
              <p className="text-lg font-semibold">{successRate.toFixed(1)}%</p>
              <Progress value={successRate} className="mt-1" />
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Queue Size</p>
            <p className="text-lg font-semibold mt-1">{stats.queueSize}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Avg. Execution Time</p>
            <p className="text-lg font-semibold mt-1">{stats.averageExecutionTime}s</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QueueHealthCard;
