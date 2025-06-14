
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Zap, Clock, CheckCircle, XCircle, Database } from "lucide-react";
import { useAutomationPerformance } from '@/hooks/useAutomationPerformance';

const PerformanceMonitor = () => {
  const { stats, isLoading, clearCache, refreshStats } = useAutomationPerformance();

  const getStatusColor = (value: number, threshold: number) => {
    if (value === 0) return 'text-gray-500';
    if (value < threshold) return 'text-green-500';
    if (value < threshold * 2) return 'text-yellow-500';
    return 'text-red-500';
  };

  const calculateQueueHealth = () => {
    const total = stats.totalJobs;
    const running = stats.runningJobs;
    const failed = stats.failedJobs;
    
    if (total === 0) return { percentage: 100, status: 'healthy' };
    
    const healthyPercentage = ((total - failed) / total) * 100;
    const isProcessing = running > 0;
    
    if (healthyPercentage > 90 && isProcessing) return { percentage: healthyPercentage, status: 'excellent' };
    if (healthyPercentage > 75) return { percentage: healthyPercentage, status: 'good' };
    if (healthyPercentage > 50) return { percentage: healthyPercentage, status: 'fair' };
    return { percentage: healthyPercentage, status: 'poor' };
  };

  const queueHealth = calculateQueueHealth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Performance Monitor</h3>
          <p className="text-sm text-muted-foreground">
            Real-time automation performance and queue management
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => clearCache()}
          >
            <Database className="h-4 w-4 mr-1" />
            Clear Cache
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshStats}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Queue Health Overview */}
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

      {/* Queue Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                <p className="text-2xl font-bold">{stats.totalJobs}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Running</p>
                <p className={`text-2xl font-bold ${getStatusColor(stats.runningJobs, 3)}`}>
                  {stats.runningJobs}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className={`text-2xl font-bold ${getStatusColor(stats.pendingJobs, 10)}`}>
                  {stats.pendingJobs}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className={`text-2xl font-bold ${getStatusColor(stats.failedJobs, 2)}`}>
                  {stats.failedJobs}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batch Queues */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Queues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats.batchQueueSizes).map(([type, count]) => {
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
            
            {Object.keys(stats.batchQueueSizes).length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No batch operations in queue
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cache Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-500" />
            Cache Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Cached Items</p>
              <p className="text-xl font-semibold">{stats.cacheSize}</p>
            </div>
            <Badge variant={stats.cacheSize > 0 ? 'default' : 'secondary'}>
              {stats.cacheSize > 0 ? 'Active' : 'Empty'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;
