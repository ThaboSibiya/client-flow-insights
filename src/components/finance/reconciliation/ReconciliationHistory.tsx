import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { format } from 'date-fns';

export interface ReconciliationRecord {
  id: string;
  invoice_number: string;
  payment_number: string;
  amount: number;
  reconciled_at: string;
  reconciled_by: string;
  status: 'matched' | 'unmatched';
  method: 'manual' | 'auto';
}

interface ReconciliationHistoryProps {
  history: ReconciliationRecord[];
}

const ReconciliationHistory: React.FC<ReconciliationHistoryProps> = ({ history }) => {
  return (
    <Card className="border-quikle-silver/20 shadow-sm">
      <CardHeader>
        <CardTitle className="text-quikle-charcoal">Reconciliation History</CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-quikle-slate">No reconciliation history available</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reconciled By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {format(new Date(record.reconciled_at), 'MMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell className="font-medium">{record.invoice_number}</TableCell>
                  <TableCell className="font-medium">{record.payment_number}</TableCell>
                  <TableCell>${record.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={record.method === 'auto' ? 'default' : 'secondary'}>
                      {record.method === 'auto' ? 'AI Auto' : 'Manual'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {record.status === 'matched' ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">Matched</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-orange-600" />
                          <span className="text-orange-600">Unmatched</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-quikle-slate">{record.reconciled_by}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default ReconciliationHistory;
