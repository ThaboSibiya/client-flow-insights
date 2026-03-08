
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAnalytics } from '@/context/AnalyticsContext';
import { TrendingUp, Users, Target, CheckCircle } from 'lucide-react';

const STAGE_COLORS = [
  'hsl(var(--chart-new))',
  'hsl(var(--chart-existing))',
  'hsl(var(--chart-pending))',
  'hsl(var(--chart-finalised))',
];

const CustomerLifecycleTracker = () => {
  const { metrics, isLoading } = useAnalytics();

  const stages = [
    { name: 'Prospects', count: metrics?.newCustomers ?? 0, icon: <Users className="h-4 w-4" />, color: STAGE_COLORS[0] },
    { name: 'Active', count: metrics?.activeCustomers ?? 0, icon: <Target className="h-4 w-4" />, color: STAGE_COLORS[1] },
    { name: 'Pending', count: metrics?.pendingCustomers ?? 0, icon: <TrendingUp className="h-4 w-4" />, color: STAGE_COLORS[2] },
    { name: 'Closed Won', count: metrics?.finalisedCustomers ?? 0, icon: <CheckCircle className="h-4 w-4" />, color: STAGE_COLORS[3] },
  ];

  const total = stages.reduce((sum, s) => sum + s.count, 0);
  const conversionRate = total > 0 ? Math.round(((metrics?.finalisedCustomers ?? 0) / total) * 100) : 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-sm text-muted-foreground">Loading lifecycle data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" style={{ color: STAGE_COLORS[1] }} />
          Customer Lifecycle Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stages.map((stage) => (
            <div key={stage.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div
                className="p-2 rounded-full"
                style={{ background: `${stage.color}20`, color: stage.color }}
              >
                {stage.icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stage.name}</p>
                <p className="text-xl font-bold text-foreground">{stage.count}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pipeline bar visualization */}
        {total > 0 && (
          <div className="flex h-3 rounded-full overflow-hidden bg-muted">
            {stages.map((stage) => (
              <div
                key={stage.name}
                className="h-full transition-all duration-500"
                style={{
                  width: `${(stage.count / total) * 100}%`,
                  background: stage.color,
                  minWidth: stage.count > 0 ? '4px' : '0',
                }}
                title={`${stage.name}: ${stage.count}`}
              />
            ))}
          </div>
        )}

        <div className="pt-3 border-t border-border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Conversion Rate</span>
            <Badge variant="secondary">{conversionRate}%</Badge>
          </div>
          <Progress value={conversionRate} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerLifecycleTracker;
