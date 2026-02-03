import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Mail, 
  RefreshCw,
  Keyboard
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FinanceHeaderProps {
  stats: {
    totalOverdue: number;
    totalDebtors: number;
    highRiskCount: number;
    criticalCount: number;
  };
  onGenerateReport: () => void;
  onBulkReminder: () => void;
  onRefresh: () => void;
}

const FinanceHeader = ({ 
  stats, 
  onGenerateReport, 
  onBulkReminder,
  onRefresh 
}: FinanceHeaderProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="border-b bg-card px-4 py-3 flex-shrink-0">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Title & Live Stats */}
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-foreground">Debtor Management</h1>
            <p className="text-xs text-muted-foreground">Track collections & send reminders</p>
          </div>
          
          {/* Live Stats Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 font-medium">
              {formatCurrency(stats.totalOverdue)} Outstanding
            </Badge>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {stats.totalDebtors} Debtors
            </Badge>
            {stats.criticalCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {stats.criticalCount} Critical
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onRefresh}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh data</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onGenerateReport}>
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Report</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Generate aging report (⌘G)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" onClick={onBulkReminder}>
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Bulk Reminder</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send bulk reminders (⌘R)</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
        <Keyboard className="h-3 w-3" />
        <span>⌘K search · ↑↓ navigate · ⌘R reminder · ⌘N note · ⌘G report</span>
      </div>
    </div>
  );
};

export default FinanceHeader;
