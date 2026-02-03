
import React, { useMemo } from 'react';
import { Users, Ticket, TrendingUp, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import KPIWidget from './widgets/KPIWidget';
import ChartWidget from './widgets/ChartWidget';
import TableWidget from './widgets/TableWidget';
import ProgressWidget from './widgets/ProgressWidget';
import { Badge } from '@/components/ui/badge';
import { useCRM } from '@/context/CRMContext';

const AnalyticsDashboard: React.FC = () => {
  const { customers } = useCRM();

  // Generate summary stats
  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'existing' || c.status === 'new').length;
    const totalTickets = customers.reduce((sum, c) => sum + (c.ticketCount || 0), 0);
    
    return {
      totalCustomers,
      activeCustomers,
      totalTickets,
      avgTicketsPerCustomer: totalCustomers > 0 ? (totalTickets / totalCustomers).toFixed(1) : 0
    };
  }, [customers]);

  // Chart data
  const revenueData = [
    { name: 'Jan', value: 12400 },
    { name: 'Feb', value: 14200 },
    { name: 'Mar', value: 13800 },
    { name: 'Apr', value: 16500 },
    { name: 'May', value: 18200 },
    { name: 'Jun', value: 17800 }
  ];

  const ticketData = [
    { name: 'Mon', value: 24 },
    { name: 'Tue', value: 32 },
    { name: 'Wed', value: 28 },
    { name: 'Thu', value: 35 },
    { name: 'Fri', value: 29 },
    { name: 'Sat', value: 12 },
    { name: 'Sun', value: 8 }
  ];

  const statusData = [
    { name: 'Active', value: stats.activeCustomers },
    { name: 'Inactive', value: stats.totalCustomers - stats.activeCustomers }
  ];

  // Top performers table data
  const topPerformers = [
    { name: 'Sarah Johnson', role: 'Account Manager', deals: 24, revenue: '$48,500' },
    { name: 'Mike Chen', role: 'Sales Rep', deals: 21, revenue: '$42,200' },
    { name: 'Emily Davis', role: 'Sales Rep', deals: 18, revenue: '$36,800' },
    { name: 'James Wilson', role: 'Account Manager', deals: 16, revenue: '$32,100' },
    { name: 'Lisa Park', role: 'Sales Rep', deals: 15, revenue: '$29,500' }
  ];

  const tableColumns = [
    { key: 'name', header: 'Name' },
    { key: 'role', header: 'Role' },
    { key: 'deals', header: 'Deals', align: 'center' as const },
    { 
      key: 'revenue', 
      header: 'Revenue', 
      align: 'right' as const,
      render: (value: string) => <span className="font-medium text-green-600">{value}</span>
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIWidget
          title="Total Customers"
          value={stats.totalCustomers.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
          color="default"
          trend={{ value: 12, direction: 'up', label: 'vs last month' }}
        />
        <KPIWidget
          title="Active Customers"
          value={stats.activeCustomers.toLocaleString()}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="success"
          trend={{ value: 8, direction: 'up', label: 'vs last month' }}
        />
        <KPIWidget
          title="Total Tickets"
          value={stats.totalTickets.toLocaleString()}
          icon={<Ticket className="h-5 w-5" />}
          color="warning"
          trend={{ value: -5, direction: 'down', label: 'vs last month' }}
        />
        <KPIWidget
          title="Avg Response Time"
          value="2.4h"
          icon={<Clock className="h-5 w-5" />}
          color="default"
          trend={{ value: -12, direction: 'down', label: 'faster' }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        <ChartWidget
          title="Revenue Trend"
          subtitle="Monthly revenue performance"
          data={revenueData}
          type="area"
          dataKey="value"
          height={220}
        />
        <ChartWidget
          title="Weekly Tickets"
          subtitle="Support tickets by day"
          data={ticketData}
          type="bar"
          dataKey="value"
          height={220}
        />
      </div>

      {/* Mixed Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TableWidget
            title="Top Performers"
            subtitle="This month's leading team members"
            columns={tableColumns}
            data={topPerformers}
            maxRows={5}
          />
        </div>
        <div className="space-y-4">
          <ProgressWidget
            title="Monthly Target"
            value={78500}
            max={100000}
            target={85000}
            subtitle="Revenue goal progress"
          />
          <ProgressWidget
            title="Customer Satisfaction"
            value={92}
            max={100}
            subtitle="Based on 1,250 reviews"
            color="success"
          />
          <ProgressWidget
            title="SLA Compliance"
            value={88}
            max={100}
            target={95}
            subtitle="Response time target"
            color="warning"
          />
        </div>
      </div>

      {/* Status Distribution */}
      <div className="grid lg:grid-cols-3 gap-4">
        <ChartWidget
          title="Customer Status"
          subtitle="Active vs Inactive breakdown"
          data={statusData}
          type="pie"
          dataKey="value"
          height={180}
        />
        <div className="lg:col-span-2">
          <ChartWidget
            title="Customer Growth"
            subtitle="New customers over time"
            data={revenueData.map(d => ({ ...d, value: Math.floor(d.value / 100) }))}
            type="line"
            dataKey="value"
            height={180}
          />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
