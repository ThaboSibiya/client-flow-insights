import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, AlertTriangle, FileText } from 'lucide-react';
import { DebtorCustomer } from '@/hooks/useDebtorData';

interface QuickActionsProps {
  stats: {
    totalOverdue: number;
    totalDebtors: number;
    highRiskCount: number;
    criticalCount: number;
  };
  debtors: DebtorCustomer[];
  onSendBulkReminders: () => void;
  onReviewHighRisk: () => void;
  onGenerateReport: () => void;
}

const QuickActions = ({ 
  stats, 
  debtors,
  onSendBulkReminders,
  onReviewHighRisk,
  onGenerateReport 
}: QuickActionsProps) => {
  const highRiskDebtors = debtors.filter(d => 
    d.finance_summary?.risk_rating === 'high' ||
    d.finance_summary?.risk_rating === 'critical' ||
    d.finance_summary?.account_status === 'collection'
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-primary/5 hover:border-primary transition-colors"
            onClick={onSendBulkReminders}
          >
            <div className="flex items-center gap-2 w-full">
              <Mail className="h-5 w-5 text-primary" />
              <h4 className="font-semibold text-sm">Send Bulk Reminders</h4>
            </div>
            <p className="text-xs text-muted-foreground text-left">
              Send payment reminders to {stats.totalDebtors} overdue customer{stats.totalDebtors !== 1 ? 's' : ''}
            </p>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-destructive/5 hover:border-destructive transition-colors"
            onClick={onReviewHighRisk}
          >
            <div className="flex items-center gap-2 w-full">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h4 className="font-semibold text-sm">Review High Risk</h4>
            </div>
            <p className="text-xs text-muted-foreground text-left">
              {highRiskDebtors.length} account{highRiskDebtors.length !== 1 ? 's' : ''} require{highRiskDebtors.length === 1 ? 's' : ''} immediate attention
            </p>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-accent hover:border-accent transition-colors"
            onClick={onGenerateReport}
          >
            <div className="flex items-center gap-2 w-full">
              <FileText className="h-5 w-5 text-accent" />
              <h4 className="font-semibold text-sm">Generate Report</h4>
            </div>
            <p className="text-xs text-muted-foreground text-left">
              Export aging report and collection summary
            </p>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
