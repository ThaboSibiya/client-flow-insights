import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AccountFlag, FlagType } from '@/types/financeBackend';
import { format } from 'date-fns';
import { Flag, CheckCircle, AlertTriangle } from 'lucide-react';

interface AccountFlagsPanelProps {
  flags: AccountFlag[];
  onResolve: (flagId: string, resolvedBy: string) => void;
}

const AccountFlagsPanel = ({ flags, onResolve }: AccountFlagsPanelProps) => {
  const getFlagIcon = (type: FlagType) => {
    switch (type) {
      case 'fraud_risk':
      case 'credit_hold':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'vip':
        return <Flag className="h-4 w-4 text-purple-600" />;
      default:
        return <Flag className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activeFlags = flags.filter(f => f.status === 'active');

  if (activeFlags.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          Account Flags ({activeFlags.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeFlags.map((flag) => (
            <div key={flag.id} className="p-3 bg-white rounded-lg border">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    {getFlagIcon(flag.flag_type)}
                    <span className="font-semibold capitalize">
                      {flag.flag_type.replace('_', ' ')}
                    </span>
                    <Badge variant="secondary" className={getPriorityColor(flag.priority)}>
                      {flag.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{flag.flag_reason}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Flagged by: {flag.flagged_by}</span>
                    <span>{format(new Date(flag.created_at), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onResolve(flag.id, 'Current User')}
                  className="flex-shrink-0"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Resolve
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountFlagsPanel;
