
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAnalytics } from '@/context/AnalyticsContext';
import { TrendingUp, Users, Target, CheckCircle } from 'lucide-react';

const CustomerLifecycleTracker = () => {
  const { metrics, isLoading } = useAnalytics();

  const stages = {
    prospect: metrics?.newCustomers ?? 0,
    active: metrics?.activeCustomers ?? 0,
    pending: metrics?.pendingCustomers ?? 0,
    closed: metrics?.finalisedCustomers ?? 0,
  };

  const total = Object.values(stages).reduce((sum, count) => sum + count, 0);
  const conversionRate = total > 0 ? Math.round((stages.closed / total) * 100) : 0;

  const stageData = [
    { name: 'Prospects', count: stages.prospect, icon: <Users className="h-4 w-4" /> },
    { name: 'Active', count: stages.active, icon: <Target className="h-4 w-4" /> },
    { name: 'Pending', count: stages.pending, icon: <TrendingUp className="h-4 w-4" /> },
    { name: 'Closed Won', count: stages.closed, icon: <CheckCircle className="h-4 w-4" /> },
  ];

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
          <TrendingUp className="h-4 w-4 text-primary" />
          Customer Lifecycle Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stageData.map((stage) => (
            <div key={stage.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                {stage.icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stage.name}</p>
                <p className="text-xl font-bold text-foreground">{stage.count}</p>
              </div>
            </div>
          ))}
        </div>
        
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
