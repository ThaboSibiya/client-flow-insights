import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CustomerTransaction, TransactionType, TransactionStatus } from '@/types/finance';
import { format } from 'date-fns';
import { Receipt, CreditCard, FileText, RefreshCw } from 'lucide-react';

interface TransactionLedgerProps {
  transactions: CustomerTransaction[];
}

const TransactionLedger = ({ transactions }: TransactionLedgerProps) => {
  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'invoice': return <Receipt className="h-4 w-4" />;
      case 'payment': return <CreditCard className="h-4 w-4" />;
      case 'credit_note': return <FileText className="h-4 w-4" />;
      case 'adjustment': return <RefreshCw className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'disputed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAmountColor = (type: TransactionType) => {
    switch (type) {
      case 'payment':
      case 'credit_note':
        return 'text-green-600';
      case 'invoice':
        return 'text-red-600';
      default:
        return 'text-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Ledger</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No transactions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.transaction_type)}
                        <span className="capitalize">{transaction.transaction_type.replace('_', ' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {transaction.reference_number}
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${getAmountColor(transaction.transaction_type)}`}>
                      {transaction.transaction_type === 'payment' || transaction.transaction_type === 'credit_note' ? '-' : '+'}
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {transaction.due_date ? format(new Date(transaction.due_date), 'MMM dd, yyyy') : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionLedger;
