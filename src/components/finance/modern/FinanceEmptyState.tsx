import { CheckCircle, FileText, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FinanceEmptyStateProps {
  onViewInvoices?: () => void;
}

const FinanceEmptyState = ({ onViewInvoices }: FinanceEmptyStateProps) => {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        
        <h2 className="text-xl font-semibold text-foreground mb-2">
          All Accounts in Good Standing
        </h2>
        
        <p className="text-muted-foreground mb-6">
          Great news! You don't have any overdue accounts requiring collection. 
          Keep up the excellent cash flow management.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-muted rounded-lg">
            <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium">0 Overdue</p>
            <p className="text-xs text-muted-foreground">All payments on time</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <FileText className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-sm font-medium">Healthy Cash Flow</p>
            <p className="text-xs text-muted-foreground">No action needed</p>
          </div>
        </div>

        {onViewInvoices && (
          <Button variant="outline" onClick={onViewInvoices}>
            <FileText className="h-4 w-4 mr-2" />
            View All Invoices
          </Button>
        )}
      </div>
    </div>
  );
};

export default FinanceEmptyState;
