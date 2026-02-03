import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  Mail, 
  Phone, 
  FileText,
  ChevronRight 
} from 'lucide-react';
import { DebtorCustomer } from '@/hooks/useDebtorData';
import { cn } from '@/lib/utils';

interface DebtorCardProps {
  debtor: DebtorCustomer;
  isSelected: boolean;
  onClick: () => void;
  onQuickAction?: (action: 'email' | 'call' | 'view') => void;
}

const DebtorCard = ({ debtor, isSelected, onClick, onQuickAction }: DebtorCardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskStyles = (risk: string) => {
    const styles = {
      critical: { 
        badge: 'bg-destructive text-destructive-foreground', 
        border: 'border-l-destructive',
        indicator: 'bg-destructive'
      },
      high: { 
        badge: 'bg-orange-500 text-white', 
        border: 'border-l-orange-500',
        indicator: 'bg-orange-500'
      },
      medium: { 
        badge: 'bg-yellow-500 text-white', 
        border: 'border-l-yellow-500',
        indicator: 'bg-yellow-500'
      },
      low: { 
        badge: 'bg-green-500 text-white', 
        border: 'border-l-green-500',
        indicator: 'bg-green-500'
      },
    };
    return styles[risk as keyof typeof styles] || styles.low;
  };

  const risk = debtor.finance_summary?.risk_rating || 'low';
  const riskStyles = getRiskStyles(risk);
  const daysOverdue = debtor.days_overdue || 0;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative p-3 border-l-4 rounded-r-lg cursor-pointer transition-all duration-200",
        "hover:bg-accent/50 hover:shadow-sm",
        riskStyles.border,
        isSelected && "bg-accent shadow-sm ring-1 ring-primary/20"
      )}
    >
      {/* Main Content */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm truncate text-foreground">
              {debtor.name}
            </h4>
            {risk === 'critical' && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className={cn("relative inline-flex rounded-full h-2 w-2", riskStyles.indicator)}></span>
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {debtor.email}
          </p>
        </div>

        <Badge className={cn("text-[10px] flex-shrink-0", riskStyles.badge)}>
          {risk.toUpperCase()}
        </Badge>
      </div>

      {/* Stats Row */}
      <div className="mt-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-destructive font-semibold">
          <AlertCircle className="h-3 w-3" />
          {formatCurrency(debtor.total_overdue || 0)}
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          {daysOverdue > 0 && (
            <span className={cn(
              "px-1.5 py-0.5 rounded text-[10px] font-medium",
              daysOverdue > 60 ? "bg-destructive/10 text-destructive" :
              daysOverdue > 30 ? "bg-orange-100 text-orange-700" :
              "bg-yellow-100 text-yellow-700"
            )}>
              {daysOverdue}d overdue
            </span>
          )}
          <span>{debtor.overdue_invoices?.length || 0} inv</span>
        </div>
      </div>

      {/* Hover Actions */}
      <div className={cn(
        "absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1",
        "opacity-0 group-hover:opacity-100 transition-opacity"
      )}>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onQuickAction?.('email');
          }}
        >
          <Mail className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onQuickAction?.('call');
          }}
        >
          <Phone className="h-3.5 w-3.5" />
        </Button>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
};

export default DebtorCard;
