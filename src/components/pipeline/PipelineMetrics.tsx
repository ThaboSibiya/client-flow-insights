
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingUp, TrendingDown, Clock, Target } from "lucide-react";

interface PipelineMetricsProps {
  type: 'customer' | 'ticket';
  stages: any[];
}

const PipelineMetrics = ({ type, stages }: PipelineMetricsProps) => {
  // Calculate metrics for each stage
  const stageMetrics = stages.map(stage => {
    const items = type === 'customer' ? (stage.customers || []) : (stage.tickets || []);
    const originalCount = stage.originalCount || items.length;
    const filteredCount = stage.filteredCount || items.length;
    
    // Calculate average time in stage (mock data)
    const avgTimeInStage = Math.floor(Math.random() * 10) + 1;
    const conversionRate = stage.target ? Math.min((filteredCount / stage.target) * 100, 100) : 0;
    
    // Identify bottlenecks - stages with high item count and low conversion
    const isBottleneck = filteredCount > 5 && conversionRate < 50;
    
    // Calculate probability scoring based on stage progression
    const probabilityScore = Math.max(0, 100 - (avgTimeInStage * 10));
    
    return {
      ...stage,
      items,
      originalCount,
      filteredCount,
      avgTimeInStage,
      conversionRate,
      isBottleneck,
      probabilityScore
    };
  });

  const totalItems = stageMetrics.reduce((sum, stage) => sum + stage.filteredCount, 0);
  const totalBottlenecks = stageMetrics.filter(stage => stage.isBottleneck).length;
  const overallConversion = stageMetrics.length > 0 
    ? stageMetrics.reduce((sum, stage) => sum + stage.conversionRate, 0) / stageMetrics.length 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Overall Metrics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total {type === 'customer' ? 'Customers' : 'Tickets'}</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalItems}</div>
          <p className="text-xs text-muted-foreground">
            Across {stages.length} stages
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{overallConversion.toFixed(1)}%</div>
          <Progress value={overallConversion} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bottlenecks</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{totalBottlenecks}</div>
          <p className="text-xs text-muted-foreground">
            {totalBottlenecks === 0 ? 'No issues detected' : 'Stages need attention'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stageMetrics.length > 0 
              ? (stageMetrics.reduce((sum, s) => sum + s.avgTimeInStage, 0) / stageMetrics.length).toFixed(1)
              : 0} days
          </div>
          <p className="text-xs text-muted-foreground">
            Per stage average
          </p>
        </CardContent>
      </Card>

      {/* Stage-specific metrics */}
      {stageMetrics.map((stage, index) => (
        <Card key={stage.id} className={stage.isBottleneck ? 'border-orange-500' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: stage.color }}
              />
              {stage.name}
              {stage.isBottleneck && (
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Items:</span>
                <Badge variant="secondary">{stage.filteredCount}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Conversion:</span>
                <Badge variant={stage.conversionRate > 70 ? 'default' : stage.conversionRate > 40 ? 'secondary' : 'destructive'}>
                  {stage.conversionRate.toFixed(1)}%
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg. Time:</span>
                <span className="text-sm text-muted-foreground">{stage.avgTimeInStage}d</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Probability:</span>
                <Badge variant={stage.probabilityScore > 70 ? 'default' : 'secondary'}>
                  {stage.probabilityScore}%
                </Badge>
              </div>
              
              {stage.target && (
                <Progress 
                  value={Math.min((stage.filteredCount / stage.target) * 100, 100)} 
                  className="mt-2"
                />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PipelineMetrics;
