
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCRM } from '@/context/CRMContext';
import { TrendingUp, Users, Target, CheckCircle } from 'lucide-react';

const CustomerLifecycleTracker = () => {
  const { customers } = useCRM();

  // Calculate lifecycle stages
  const stages = {
    prospect: customers.filter(c => c.status === 'new').length,
    qualified: customers.filter(c => c.status === 'existing').length,
    negotiation: customers.filter(c => c.status === 'pending').length,
    closed: customers.filter(c => c.status === 'finalised').length,
  };

  const total = Object.values(stages).reduce((sum, count) => sum + count, 0);
  const conversionRate = total > 0 ? Math.round((stages.closed / total) * 100) : 0;

  const stageData = [
    { name: 'Prospects', count: stages.prospect, color: 'bg-quikle-charcoal', icon: <Users className="h-4 w-4" /> },
    { name: 'Qualified', count: stages.qualified, color: 'bg-quikle-slate', icon: <Target className="h-4 w-4" /> },
    { name: 'Negotiation', count: stages.negotiation, color: 'bg-quikle-neutral', icon: <TrendingUp className="h-4 w-4" /> },
    { name: 'Closed Won', count: stages.closed, color: 'bg-quikle-accent', icon: <CheckCircle className="h-4 w-4" /> },
  ];

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-quikle-primary" />
          Customer Lifecycle Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {stageData.map((stage) => (
            <div key={stage.name} className="flex items-center gap-3 p-3 rounded-lg bg-quikle-crystal">
              <div className={`p-2 rounded-full ${stage.color} text-white`}>
                {stage.icon}
              </div>
              <div>
                <p className="text-sm font-medium">{stage.name}</p>
                <p className="text-2xl font-bold">{stage.count}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall Conversion Rate</span>
            <Badge variant="secondary">{conversionRate}%</Badge>
          </div>
          <Progress value={conversionRate} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerLifecycleTracker;
