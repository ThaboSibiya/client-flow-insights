import React, { useMemo, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, TrendingDown, Users, Ticket, Clock, Target, 
  BarChart3, ArrowUpRight, ArrowDownRight, Calendar, ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { CustomerPipelineStage, TicketPipelineStage } from '@/types/pipeline';

interface EnhancedPipelineMetricsProps {
  type: 'customer' | 'ticket';
  stages: (CustomerPipelineStage | TicketPipelineStage)[];
}

type DateRange = '7d' | '30d' | '90d' | 'all';

const EnhancedPipelineMetrics = ({ type, stages }: EnhancedPipelineMetricsProps) => {
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  const metrics = useMemo(() => {
    const now = new Date();
    const ranges: Record<DateRange, number> = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      'all': Infinity,
    };

    const filterDate = new Date(now.getTime() - ranges[dateRange]);

    // Get all items with proper typing
    const allItems: Array<{ createdAt: Date | string; totalTimeSpent?: number }> = [];
    stages.forEach(stage => {
      if (type === 'customer') {
        const customers = (stage as CustomerPipelineStage).customers || [];
        customers.forEach(c => allItems.push(c));
      } else {
        const tickets = (stage as TicketPipelineStage).tickets || [];
        tickets.forEach(t => allItems.push(t));
      }
    });

    // Filter by date range
    const filteredItems = dateRange === 'all' ? allItems : allItems.filter(item => {
      const createdAt = new Date(item.createdAt);
      return createdAt >= filterDate;
    });

    const totalItems = filteredItems.length;

    // Calculate completed items (closed/resolved stages)
    const completedStages = stages.filter(stage => {
      const name = stage.name.toLowerCase();
      return name.includes('closed') || name.includes('resolved') || name.includes('won');
    });

    const completedItems = completedStages.reduce((sum, stage) => {
      const items = type === 'customer' 
        ? (stage as CustomerPipelineStage).customers || []
        : (stage as TicketPipelineStage).tickets || [];
      return sum + items.filter(item => {
        if (dateRange === 'all') return true;
        return new Date(item.createdAt) >= filterDate;
      }).length;
    }, 0);

    const conversionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    // Calculate average time in pipeline (for tickets)
    let avgTimeInPipeline = 0;
    if (type === 'ticket') {
      const allTickets = stages.flatMap(stage => (stage as TicketPipelineStage).tickets || []);
      const totalTime = allTickets.reduce((sum, ticket) => sum + (ticket.totalTimeSpent || 0), 0);
      avgTimeInPipeline = allTickets.length > 0 ? totalTime / allTickets.length : 0;
    }

    // Calculate stage distribution for funnel
    const stageDistribution = stages.map(stage => {
      const items = type === 'customer'
        ? (stage as CustomerPipelineStage).customers || []
        : (stage as TicketPipelineStage).tickets || [];
      return {
        name: stage.name,
        color: stage.color,
        count: items.length,
        target: stage.target,
        percentage: totalItems > 0 ? (items.length / totalItems) * 100 : 0,
      };
    });

    // Calculate velocity (items moved to completed per week)
    const velocityPerWeek = dateRange !== 'all' 
      ? (completedItems / (ranges[dateRange] / (7 * 24 * 60 * 60 * 1000)))
      : 0;

    return {
      totalItems,
      completedItems,
      conversionRate,
      avgTimeInPipeline,
      stageDistribution,
      velocityPerWeek,
      stagesWithTargets: stages.filter(s => s.target).length,
      automatedStages: stages.filter(s => s.automationEnabled).length,
    };
  }, [stages, type, dateRange]);

  const dateRangeLabels: Record<DateRange, string> = {
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
    '90d': 'Last 90 days',
    'all': 'All time',
  };

  return (
    <div className="space-y-4">
      {/* Date range selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Pipeline Overview</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Calendar className="h-3.5 w-3.5 mr-2" />
              {dateRangeLabels[dateRange]}
              <ChevronDown className="h-3.5 w-3.5 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.entries(dateRangeLabels).map(([key, label]) => (
              <DropdownMenuItem 
                key={key} 
                onClick={() => setDateRange(key as DateRange)}
                className={dateRange === key ? 'bg-accent' : ''}
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Items */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                {type === 'customer' ? (
                  <Users className="h-4 w-4 text-primary" />
                ) : (
                  <Ticket className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Total {type}s</p>
                <p className="text-2xl font-bold">{metrics.totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${metrics.conversionRate >= 50 ? 'bg-green-500/10' : 'bg-amber-500/10'}`}>
                <Target className={`h-4 w-4 ${metrics.conversionRate >= 50 ? 'text-green-500' : 'text-amber-500'}`} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Conversion</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</p>
                  {metrics.conversionRate >= 50 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-amber-500" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Velocity or Avg Time */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                {type === 'ticket' ? (
                  <Clock className="h-4 w-4 text-blue-500" />
                ) : (
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">
                  {type === 'ticket' ? 'Avg Time' : 'Velocity'}
                </p>
                <p className="text-2xl font-bold">
                  {type === 'ticket' 
                    ? `${Math.round(metrics.avgTimeInPipeline / 60)}h`
                    : `${metrics.velocityPerWeek.toFixed(1)}/wk`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{metrics.completedItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Visualization */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium">Stage Distribution</h4>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{metrics.stagesWithTargets} targets set</span>
              <span>{metrics.automatedStages} automated</span>
            </div>
          </div>
          <div className="space-y-3">
            {metrics.stageDistribution.map((stage, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="font-medium">{stage.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{stage.count}</span>
                    {stage.target && (
                      <Badge variant="outline" className="text-xs">
                        / {stage.target}
                      </Badge>
                    )}
                  </div>
                </div>
                <Progress 
                  value={stage.target ? (stage.count / stage.target) * 100 : stage.percentage} 
                  className="h-2"
                  style={{ 
                    '--progress-background': stage.color 
                  } as React.CSSProperties}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedPipelineMetrics;
