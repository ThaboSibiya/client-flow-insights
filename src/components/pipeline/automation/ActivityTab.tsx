import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Activity, Clock, CheckCircle } from 'lucide-react';
import AutomationAuditLog from './audit/AutomationAuditLog';

interface Automation {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  isActive: boolean;
  type: 'customer' | 'ticket';
  triggerType?: 'simple' | 'advanced' | 'time' | 'webhook';
  lastTriggered?: string;
  triggerCount?: number;
}

interface ActivityTabProps {
  automations: Automation[];
}

const ActivityTab = ({ automations }: ActivityTabProps) => {
  const [activeSubTab, setActiveSubTab] = useState('overview');

  const activeAutomations = automations.filter(a => a.isActive).length;
  const totalTriggers = automations.reduce((sum, a) => sum + (a.triggerCount || 0), 0);
  const avgTriggersPerAutomation = automations.length > 0 ? Math.round(totalTriggers / automations.length) : 0;

  const chartData = automations
    .filter(a => (a.triggerCount || 0) > 0)
    .sort((a, b) => (b.triggerCount || 0) - (a.triggerCount || 0))
    .slice(0, 8)
    .map(automation => ({
      name: automation.name.length > 15 ? automation.name.substring(0, 15) + '...' : automation.name,
      triggers: automation.triggerCount || 0,
    }));

  const timelineData = [
    { day: 'Mon', executions: 12 },
    { day: 'Tue', executions: 19 },
    { day: 'Wed', executions: 15 },
    { day: 'Thu', executions: 22 },
    { day: 'Fri', executions: 28 },
    { day: 'Sat', executions: 8 },
    { day: 'Sun', executions: 5 },
  ];

  const statsCards = [
    { label: 'Total Workflows', value: automations.length, icon: TrendingUp, color: 'text-primary', bgColor: 'bg-primary/10' },
    { label: 'Active', value: activeAutomations, icon: CheckCircle, color: 'text-primary', bgColor: 'bg-primary/10' },
    { label: 'Total Runs', value: totalTriggers, icon: Activity, color: 'text-accent-foreground', bgColor: 'bg-accent' },
    { label: 'Avg per Workflow', value: avgTriggersPerAutomation, icon: Clock, color: 'text-muted-foreground', bgColor: 'bg-muted' },
  ];

  return (
    <div className="space-y-4">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {statsCards.map(({ label, value, icon: StatIcon, color, bgColor }) => (
              <Card key={label} className="border-0 bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${bgColor}`}>
                      <StatIcon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div>
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-0 bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Executions This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="executions"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Top Workflows by Runs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" className="text-xs" />
                        <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            background: 'hsl(var(--popover))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="triggers" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                      No execution data yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <AutomationAuditLog />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ActivityTab;
