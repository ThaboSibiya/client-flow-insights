import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useCRM } from '@/context/CRMContext';
import { Mic, Globe, Users, Webhook, HelpCircle } from 'lucide-react';

const SOURCE_COLORS: Record<string, string> = {
  'Voice AI Agent': 'hsl(var(--primary))',
  'Website': 'hsl(var(--accent))',
  'Referral': 'hsl(142, 71%, 45%)',
  'webhook': 'hsl(262, 83%, 58%)',
  'Unknown': 'hsl(var(--muted-foreground))',
};

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  'Voice AI Agent': <Mic className="h-3.5 w-3.5" />,
  'Website': <Globe className="h-3.5 w-3.5" />,
  'Referral': <Users className="h-3.5 w-3.5" />,
  'webhook': <Webhook className="h-3.5 w-3.5" />,
  'Unknown': <HelpCircle className="h-3.5 w-3.5" />,
};

const LeadSourceBreakdown: React.FC = () => {
  const { customers } = useCRM();

  const sourceData = useMemo(() => {
    const counts: Record<string, number> = {};
    customers.forEach(c => {
      const source = c.source || 'Unknown';
      counts[source] = (counts[source] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value,
        color: SOURCE_COLORS[name] || `hsl(${Math.random() * 360}, 60%, 50%)`,
      }))
      .sort((a, b) => b.value - a.value);
  }, [customers]);

  const total = sourceData.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return null;
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">Lead Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Chart */}
          <div className="w-32 h-32 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value} leads`, '']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2">
            {sourceData.map((entry) => {
              const pct = total > 0 ? Math.round((entry.value / total) * 100) : 0;
              return (
                <div key={entry.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-foreground truncate flex items-center gap-1.5">
                      {SOURCE_ICONS[entry.name]}
                      {entry.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-medium text-foreground">{entry.value}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {pct}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadSourceBreakdown;
