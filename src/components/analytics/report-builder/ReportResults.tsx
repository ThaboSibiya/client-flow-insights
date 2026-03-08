
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Table } from 'lucide-react';
import { ReportField } from '../CustomReportBuilder';

interface ReportResultsProps {
  data: Record<string, unknown>[];
  fields: ReportField[];
  chartType: string;
  groupBy: string;
}

const CHART_COLORS = [
  'hsl(var(--chart-new))',
  'hsl(var(--chart-existing))',
  'hsl(var(--chart-pending))',
  'hsl(var(--chart-finalised))',
  'hsl(var(--chart-churn))',
];

const ReportResults: React.FC<ReportResultsProps> = ({ data, fields, chartType, groupBy }) => {
  const groupedData = useMemo(() => {
    if (!groupBy || groupBy === 'none' || !data.length) return null;

    const groupField = groupBy === 'status' ? 'status'
      : groupBy === 'created_date' ? 'created_at'
      : 'updated_at';

    const groups: Record<string, number> = {};
    data.forEach(row => {
      let key = String(row[groupField] ?? 'Unknown');
      if (groupBy.includes('date')) {
        key = new Date(key).toLocaleDateString('default', { month: 'short', year: '2-digit' });
      }
      groups[key] = (groups[key] || 0) + 1;
    });

    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  }, [data, groupBy]);

  const renderChart = () => {
    if (!groupedData) return null;

    const tooltipStyle = {
      background: 'hsl(var(--popover))',
      border: '1px solid hsl(var(--border))',
      borderRadius: 8,
      color: 'hsl(var(--popover-foreground))',
    };

    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={groupedData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
              {groupedData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={groupedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // Default: bar chart
    return (
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={groupedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Table className="h-4 w-4 text-primary" />
          Results
          <Badge variant="secondary" className="text-[10px]">{data.length} rows</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {chartType !== 'table' && groupedData && renderChart()}

        <div className="overflow-auto max-h-64 border border-border rounded-lg">
          <table className="w-full text-xs">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                {fields.map(field => (
                  <th key={field.id} className="text-left p-2 font-medium text-muted-foreground">
                    {field.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 50).map((row, i) => (
                <tr key={i} className="border-t border-border">
                  {fields.map(field => (
                    <td key={field.id} className="p-2 text-foreground">
                      {field.type === 'status' ? (
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {String(row[field.dbColumn] ?? '')}
                        </Badge>
                      ) : field.type === 'date' ? (
                        new Date(String(row[field.dbColumn])).toLocaleDateString()
                      ) : (
                        String(row[field.dbColumn] ?? '')
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length > 50 && (
            <p className="text-center py-2 text-xs text-muted-foreground">
              Showing 50 of {data.length} rows
            </p>
          )}
        </div>

        {data.length === 0 && (
          <p className="text-center py-8 text-sm text-muted-foreground">No results found for the selected criteria.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportResults;
