import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomerFinanceSummary } from '@/types/finance';
import { DollarSign, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface AccountSnapshotProps {
  summary: CustomerFinanceSummary | null;
}

const AccountSnapshot = ({ summary }: AccountSnapshotProps) => {
  if (!summary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Snapshot</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading financial summary...</p>
        </CardContent>
      </Card>
    );
  }

  const getRiskColor = (rating: string) => {
    switch (rating) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Account Snapshot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Total Owed</span>
            </div>
            <p className="text-2xl font-bold">${summary.total_owed.toFixed(2)}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Last Payment</span>
            </div>
            <p className="text-2xl font-bold">
              {summary.last_payment_amount ? `$${summary.last_payment_amount.toFixed(2)}` : 'N/A'}
            </p>
            {summary.last_payment_date && (
              <p className="text-xs text-muted-foreground">
                {format(new Date(summary.last_payment_date), 'MMM dd, yyyy')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Next Due Date</span>
            </div>
            <p className="text-xl font-semibold">
              {summary.next_due_date ? format(new Date(summary.next_due_date), 'MMM dd, yyyy') : 'Not set'}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Credit Terms</p>
            <p className="text-lg font-medium">{summary.credit_terms}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Risk Rating</span>
            </div>
            <p className={`text-lg font-bold uppercase ${getRiskColor(summary.risk_rating)}`}>
              {summary.risk_rating}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <p className="text-2xl font-bold">${summary.current_balance.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSnapshot;
