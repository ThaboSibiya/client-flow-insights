import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Invoice, InvoiceStatus } from '@/types/financeBackend';
import { format } from 'date-fns';
import { FileText, Eye } from 'lucide-react';

interface InvoicesTableProps {
  invoices: Invoice[];
  onUpdateStatus: (invoiceId: string, status: string) => void;
}

const InvoicesTable = ({ invoices, onUpdateStatus }: InvoicesTableProps) => {
  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-orange-100 text-orange-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Invoices
        </CardTitle>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No invoices found</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-sm">
                      {invoice.invoice_number}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.issue_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      R{invoice.total_amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {invoice.status === 'sent' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateStatus(invoice.id, 'paid')}
                          >
                            Mark Paid
                          </Button>
                        )}
                      </div>
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

export default InvoicesTable;
