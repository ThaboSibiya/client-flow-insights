
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, Zap } from "lucide-react";

interface QueueStatsGridProps {
  stats: any;
}

const QueueStatsGrid = ({ stats }: QueueStatsGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalExecutions}</div>
          <p className="text-xs text-muted-foreground">Last 24 hours</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Successful</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.successfulExecutions}</div>
          <p className="text-xs text-muted-foreground">
            {((stats.successfulExecutions / stats.totalExecutions) * 100).toFixed(1)}% success rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Failed</CardTitle>
          <XCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.failedExecutions}</div>
          <p className="text-xs text-muted-foreground">
            {((stats.failedExecutions / stats.totalExecutions) * 100).toFixed(1)}% failure rate
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Automations</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeAutomations}</div>
          <p className="text-xs text-muted-foreground">Currently running</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QueueStatsGrid;
