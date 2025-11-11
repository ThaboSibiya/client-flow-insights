import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, Users, DollarSign } from 'lucide-react';
import QuickActions from './QuickActions';
import { DebtorCustomer } from '@/hooks/useDebtorData';

interface FinanceOverviewTabProps {
  stats: {
    totalOverdue: number;
    totalDebtors: number;
    highRiskCount: number;
    criticalCount: number;
  };
  loading: boolean;
  debtors: DebtorCustomer[];
  onSendBulkReminders: () => void;
  onReviewHighRisk: () => void;
  onGenerateReport: () => void;
}

const FinanceOverviewTab = ({ 
  stats, 
  loading, 
  debtors,
  onSendBulkReminders,
  onReviewHighRisk,
  onGenerateReport 
}: FinanceOverviewTabProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  const metrics = [
    {
      title: 'Total Outstanding',
      value: formatCurrency(stats.totalOverdue),
      icon: DollarSign,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Active Debtors',
      value: stats.totalDebtors.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'High Risk Accounts',
      value: stats.highRiskCount.toString(),
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Critical/Collection',
      value: stats.criticalCount.toString(),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold mt-2">
                      {loading ? '...' : metric.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${metric.bgColor}`}>
                    <Icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Debtor Management Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-red-500 pl-4 py-2">
              <h4 className="font-semibold text-foreground">Critical Actions Required</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.criticalCount} account(s) require immediate attention for collection or escalation.
              </p>
            </div>
            
            <div className="border-l-4 border-orange-500 pl-4 py-2">
              <h4 className="font-semibold text-foreground">High Risk Monitoring</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.highRiskCount} account(s) are flagged as high risk and need regular follow-up.
              </p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h4 className="font-semibold text-foreground">Active Debtors</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.totalDebtors} customer(s) currently have outstanding invoices requiring collection efforts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <QuickActions 
        stats={stats}
        debtors={debtors}
        onSendBulkReminders={onSendBulkReminders}
        onReviewHighRisk={onReviewHighRisk}
        onGenerateReport={onGenerateReport}
      />
    </div>
  );
};

export default FinanceOverviewTab;
