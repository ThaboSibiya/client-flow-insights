import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Users,
  DollarSign,
  Zap
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface ReconciliationAnalyticsProps {
  dateRange?: number; // days
}

interface TrendData {
  date: string;
  matched: number;
  unmatched: number;
  partial: number;
}

interface SpeedMetric {
  avgDaysToReconcile: number;
  fastestReconciliation: number;
  slowestReconciliation: number;
  totalReconciled: number;
}

interface CustomerMetric {
  customerId: string;
  customerName: string;
  unmatchedCount: number;
  unmatchedAmount: number;
}

const COLORS = {
  matched: '#10b981',
  partial: '#f59e0b',
  unmatched: '#ef4444',
  primary: '#6366f1',
  secondary: '#8b5cf6'
};

const ReconciliationAnalyticsDashboard: React.FC<ReconciliationAnalyticsProps> = ({ 
  dateRange = 30 
}) => {
  const { user } = useAuth();
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [speedMetrics, setSpeedMetrics] = useState<SpeedMetric | null>(null);
  const [topCustomers, setTopCustomers] = useState<CustomerMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '30' | '90'>('30');

  useEffect(() => {
    if (user) {
      fetchAnalyticsData(parseInt(selectedPeriod));
    }
  }, [user, selectedPeriod]);

  const fetchAnalyticsData = async (days: number) => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTrendData(days),
        fetchSpeedMetrics(),
        fetchTopCustomers()
      ]);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendData = async (days: number) => {
    if (!user) return;

    const startDate = startOfDay(subDays(new Date(), days));
    const trends: TrendData[] = [];

    // Generate date range
    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), days - i - 1), 'MMM dd');
      const dayStart = startOfDay(subDays(new Date(), days - i - 1));
      const dayEnd = endOfDay(subDays(new Date(), days - i - 1));

      // Fetch invoices created on this day
      const { data: invoices } = await supabase
        .from('invoices')
        .select('status')
        .eq('user_id', user.id)
        .gte('created_at', dayStart.toISOString())
        .lte('created_at', dayEnd.toISOString());

      const matched = invoices?.filter(inv => inv.status === 'paid').length || 0;
      const partial = invoices?.filter(inv => inv.status === 'partial').length || 0;
      const unmatched = invoices?.filter(inv => 
        inv.status !== 'paid' && inv.status !== 'partial' && inv.status !== 'cancelled'
      ).length || 0;

      trends.push({ date, matched, partial, unmatched });
    }

    setTrendData(trends);
  };

  const fetchSpeedMetrics = async () => {
    if (!user) return;

    // Fetch payments with invoice associations
    const { data: payments } = await supabase
      .from('payments')
      .select(`
        id,
        payment_date,
        created_at,
        invoice_id,
        invoices!inner(created_at, status)
      `)
      .eq('user_id', user.id)
      .not('invoice_id', 'is', null)
      .gte('created_at', subDays(new Date(), 90).toISOString());

    if (!payments || payments.length === 0) {
      setSpeedMetrics({
        avgDaysToReconcile: 0,
        fastestReconciliation: 0,
        slowestReconciliation: 0,
        totalReconciled: 0
      });
      return;
    }

    const reconciliationTimes = payments.map(payment => {
      const invoiceDate = new Date(payment.invoices.created_at);
      const paymentDate = new Date(payment.payment_date);
      return Math.abs((paymentDate.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
    });

    setSpeedMetrics({
      avgDaysToReconcile: Math.round(
        reconciliationTimes.reduce((a, b) => a + b, 0) / reconciliationTimes.length
      ),
      fastestReconciliation: Math.round(Math.min(...reconciliationTimes)),
      slowestReconciliation: Math.round(Math.max(...reconciliationTimes)),
      totalReconciled: payments.length
    });
  };

  const fetchTopCustomers = async () => {
    if (!user) return;

    // Fetch unmatched invoices grouped by customer
    const { data: invoices } = await supabase
      .from('invoices')
      .select(`
        id,
        customer_id,
        total_amount,
        status,
        customers!inner(id, name)
      `)
      .eq('user_id', user.id)
      .in('status', ['pending', 'sent', 'overdue']);

    if (!invoices) return;

    // Group by customer
    const customerMap = new Map<string, CustomerMetric>();
    
    invoices.forEach(invoice => {
      const customerId = invoice.customer_id;
      const customerName = invoice.customers.name;
      
      if (customerMap.has(customerId)) {
        const existing = customerMap.get(customerId)!;
        existing.unmatchedCount += 1;
        existing.unmatchedAmount += Number(invoice.total_amount);
      } else {
        customerMap.set(customerId, {
          customerId,
          customerName,
          unmatchedCount: 1,
          unmatchedAmount: Number(invoice.total_amount)
        });
      }
    });

    // Sort by unmatched amount and take top 10
    const sorted = Array.from(customerMap.values())
      .sort((a, b) => b.unmatchedAmount - a.unmatchedAmount)
      .slice(0, 10);

    setTopCustomers(sorted);
  };

  const getPieChartData = () => {
    const totals = trendData.reduce(
      (acc, day) => ({
        matched: acc.matched + day.matched,
        partial: acc.partial + day.partial,
        unmatched: acc.unmatched + day.unmatched
      }),
      { matched: 0, partial: 0, unmatched: 0 }
    );

    return [
      { name: 'Fully Matched', value: totals.matched, color: COLORS.matched },
      { name: 'Partial', value: totals.partial, color: COLORS.partial },
      { name: 'Unmatched', value: totals.unmatched, color: COLORS.unmatched }
    ];
  };

  const MetricCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend,
    color = "text-quikle-primary"
  }: any) => (
    <Card className="border-quikle-silver/20 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-quikle-slate">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className={`text-3xl font-bold ${color}`}>{value}</h3>
              {trend && (
                <Badge 
                  variant={trend.direction === 'up' ? 'default' : 'secondary'}
                  className={trend.direction === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                >
                  {trend.direction === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {trend.value}
                </Badge>
              )}
            </div>
            {subtitle && <p className="text-xs text-quikle-slate">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-lg bg-gradient-to-br from-${color}/10 to-${color}/5`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Card className="border-quikle-silver/20">
        <CardContent className="p-12 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pieData = getPieChartData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-quikle-charcoal">Reconciliation Analytics</h2>
          <p className="text-sm text-quikle-slate">Track performance and identify trends</p>
        </div>
        <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as any)}>
          <TabsList>
            <TabsTrigger value="7">7 Days</TabsTrigger>
            <TabsTrigger value="30">30 Days</TabsTrigger>
            <TabsTrigger value="90">90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Avg. Days to Reconcile"
          value={speedMetrics?.avgDaysToReconcile || 0}
          subtitle="Average reconciliation time"
          icon={Clock}
          color="text-blue-600"
        />
        <MetricCard
          title="Total Reconciled"
          value={speedMetrics?.totalReconciled || 0}
          subtitle="Last 90 days"
          icon={CheckCircle2}
          color="text-green-600"
        />
        <MetricCard
          title="Fastest Match"
          value={`${speedMetrics?.fastestReconciliation || 0}d`}
          subtitle="Best reconciliation time"
          icon={Zap}
          color="text-yellow-600"
        />
        <MetricCard
          title="Pending Customers"
          value={topCustomers.length}
          subtitle="With unmatched invoices"
          icon={Users}
          color="text-purple-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <Card className="border-quikle-silver/20 shadow-sm">
          <CardHeader>
            <CardTitle className="text-quikle-charcoal">Reconciliation Trends</CardTitle>
            <CardDescription>Invoice status over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="matched" 
                  stackId="1"
                  stroke={COLORS.matched} 
                  fill={COLORS.matched}
                  fillOpacity={0.6}
                  name="Matched"
                />
                <Area 
                  type="monotone" 
                  dataKey="partial" 
                  stackId="1"
                  stroke={COLORS.partial} 
                  fill={COLORS.partial}
                  fillOpacity={0.6}
                  name="Partial"
                />
                <Area 
                  type="monotone" 
                  dataKey="unmatched" 
                  stackId="1"
                  stroke={COLORS.unmatched} 
                  fill={COLORS.unmatched}
                  fillOpacity={0.6}
                  name="Unmatched"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="border-quikle-silver/20 shadow-sm">
          <CardHeader>
            <CardTitle className="text-quikle-charcoal">Status Distribution</CardTitle>
            <CardDescription>Overall reconciliation status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers with Unmatched Invoices */}
      <Card className="border-quikle-silver/20 shadow-sm">
        <CardHeader>
          <CardTitle className="text-quikle-charcoal flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Top Customers by Unmatched Invoices
          </CardTitle>
          <CardDescription>Customers requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          {topCustomers.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-quikle-slate">All invoices are reconciled!</p>
            </div>
          ) : (
            <div className="space-y-2">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCustomers} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    type="number"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    stroke="#9ca3af"
                  />
                  <YAxis 
                    type="category"
                    dataKey="customerName" 
                    width={150}
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    stroke="#9ca3af"
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === 'unmatchedAmount') {
                        return [`$${value.toLocaleString()}`, 'Total Amount'];
                      }
                      return [value, 'Unmatched Count'];
                    }}
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="unmatchedAmount" 
                    fill={COLORS.unmatched} 
                    name="Amount ($)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              
              <ScrollArea className="h-64 mt-4">
                <div className="space-y-2">
                  {topCustomers.map((customer, index) => (
                    <div 
                      key={customer.customerId}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-800 font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-quikle-charcoal">{customer.customerName}</p>
                          <p className="text-sm text-quikle-slate">
                            {customer.unmatchedCount} unmatched invoice{customer.unmatchedCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">
                          ${customer.unmatchedAmount.toLocaleString()}
                        </p>
                        <Badge variant="destructive" className="bg-red-100 text-red-800">
                          <DollarSign className="h-3 w-3 mr-1" />
                          Outstanding
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReconciliationAnalyticsDashboard;