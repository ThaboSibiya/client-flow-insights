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
            className="h-auto p-3 md:p-4 flex flex-col items-start gap-1.5 md:gap-2 hover:bg-primary/5 hover:border-primary transition-colors min-h-[80px]"
            onClick={onSendBulkReminders}
          >
            <div className="flex items-center gap-2 w-full min-w-0">
              <Mail className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
              <h4 className="font-semibold text-xs md:text-sm text-left truncate">Bulk Reminders</h4>
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground text-left break-words line-clamp-2">
              Send reminders to {stats.totalDebtors} overdue customer{stats.totalDebtors !== 1 ? 's' : ''}
            </p>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-3 md:p-4 flex flex-col items-start gap-1.5 md:gap-2 hover:bg-destructive/5 hover:border-destructive transition-colors min-h-[80px]"
            onClick={onReviewHighRisk}
          >
            <div className="flex items-center gap-2 w-full">
              <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-destructive flex-shrink-0" />
              <h4 className="font-semibold text-xs md:text-sm text-left break-words">Review High Risk</h4>
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground text-left break-words line-clamp-2">
              {highRiskDebtors.length} account{highRiskDebtors.length !== 1 ? 's' : ''} need attention
            </p>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-3 md:p-4 flex flex-col items-start gap-1.5 md:gap-2 hover:bg-accent hover:border-accent transition-colors min-h-[80px]"
            onClick={onGenerateReport}
          >
            <div className="flex items-center gap-2 w-full">
              <FileText className="h-4 w-4 md:h-5 md:w-5 text-accent flex-shrink-0" />
              <h4 className="font-semibold text-xs md:text-sm text-left break-words">Generate Report</h4>
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground text-left break-words line-clamp-2">
              Export aging report & summary
            </p>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
