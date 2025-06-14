
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, Ticket, Clock, Target } from "lucide-react";

interface PipelineMetricsProps {
  type: 'customer' | 'ticket';
  stages: any[];
}

const PipelineMetrics = ({ type, stages }: PipelineMetricsProps) => {
  const totalItems = stages.reduce((sum, stage) => {
    const items = type === 'customer' ? (stage.customers || []) : (stage.tickets || []);
    return sum + items.length;
  }, 0);

  const completedStages = stages.filter(stage => {
    const isCompleted = stage.name.toLowerCase().includes('closed') || 
                       stage.name.toLowerCase().includes('resolved') ||
                       stage.name.toLowerCase().includes('won');
    return isCompleted;
  });

  const completedItems = completedStages.reduce((sum, stage) => {
    const items = type === 'customer' ? (stage.customers || []) : (stage.tickets || []);
    return sum + items.length;
  }, 0);

  const conversionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const avgTimeInPipeline = type === 'ticket' ? 
    stages.reduce((sum, stage) => {
      const tickets = stage.tickets || [];
      const avgTime = tickets.reduce((ticketSum, ticket) => {
        return ticketSum + (ticket.totalTimeSpent || 0);
      }, 0) / Math.max(tickets.length, 1);
      return sum + avgTime;
    }, 0) / Math.max(stages.length, 1) : null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            {type === 'customer' ? <Users className="h-4 w-4 text-quikle-primary" /> : <Ticket className="h-4 w-4 text-quikle-success" />}
            <div>
              <p className="text-sm text-quikle-slate">Total {type}s</p>
              <p className="text-2xl font-bold text-quikle-charcoal">{totalItems}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-quikle-accent" />
            <div>
              <p className="text-sm text-quikle-slate">Conversion Rate</p>
              <div className="flex items-center gap-1">
                <p className="text-2xl font-bold text-quikle-charcoal">{conversionRate.toFixed(1)}%</p>
                {conversionRate > 50 ? 
                  <TrendingUp className="h-4 w-4 text-quikle-success" /> : 
                  <TrendingDown className="h-4 w-4 text-red-500" />
                }
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{stages.length}</Badge>
            <div>
              <p className="text-sm text-quikle-slate">Active Stages</p>
              <p className="text-lg font-semibold text-quikle-charcoal">Pipeline</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {avgTimeInPipeline !== null && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-quikle-info" />
              <div>
                <p className="text-sm text-quikle-slate">Avg Time</p>
                <p className="text-2xl font-bold text-quikle-charcoal">{Math.round(avgTimeInPipeline / 60)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PipelineMetrics;
