import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { financeAuditService, FinanceAction, FinanceResource } from '@/services/financeAuditService';
import { useFinancePermissions } from '@/hooks/useFinancePermissions';
import { format } from 'date-fns';
import { Shield, Eye, Edit, Trash2, Download, FileText, DollarSign } from 'lucide-react';

interface AuditLog {
  id: string;
  action_type: FinanceAction;
  resource_type: FinanceResource;
  resource_id: string | null;
  customer_id: string | null;
  old_values: any;
  new_values: any;
  metadata: any;
  created_at: string;
  employee_id: string | null;
}

interface FinanceAuditLogProps {
  customerId?: string;
  limit?: number;
}

const FinanceAuditLog = ({ customerId, limit = 50 }: FinanceAuditLogProps) => {
  const { permissions, loading: permissionsLoading } = useFinancePermissions();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterResource, setFilterResource] = useState<string>('all');

  useEffect(() => {
    const fetchLogs = async () => {
      if (!permissions.canView) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const fetchedLogs = await financeAuditService.getAuditLogs({
        customerId,
        actionType: filterAction !== 'all' ? (filterAction as FinanceAction) : undefined,
        resourceType: filterResource !== 'all' ? (filterResource as FinanceResource) : undefined,
        limit
      });
      setLogs(fetchedLogs as AuditLog[]);
      setLoading(false);
    };

    if (!permissionsLoading) {
      fetchLogs();
    }
  }, [customerId, permissions, permissionsLoading, filterAction, filterResource, limit]);

  const getActionIcon = (action: FinanceAction) => {
    switch (action) {
      case 'view': return <Eye className="h-4 w-4" />;
      case 'create': return <FileText className="h-4 w-4" />;
      case 'update': return <Edit className="h-4 w-4" />;
      case 'delete': return <Trash2 className="h-4 w-4" />;
      case 'export': return <Download className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      case 'statement_generated': return <FileText className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: FinanceAction) => {
    switch (action) {
      case 'view': return 'bg-blue-100 text-blue-800';
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-yellow-100 text-yellow-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'export': return 'bg-purple-100 text-purple-800';
      case 'payment': return 'bg-emerald-100 text-emerald-800';
      case 'statement_generated': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (permissionsLoading || loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading audit logs...</p>
        </CardContent>
      </Card>
    );
  }

  if (!permissions.canView) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              You don't have permission to view audit logs.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Contact your finance administrator for access.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Finance Audit Log
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="view">View</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="export">Export</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterResource} onValueChange={setFilterResource}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="invoice">Invoice</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="transaction">Transaction</SelectItem>
                <SelectItem value="summary">Summary</SelectItem>
                <SelectItem value="statement">Statement</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No audit logs found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getActionColor(log.action_type)}>
                        <span className="flex items-center gap-1">
                          {getActionIcon(log.action_type)}
                          {log.action_type.replace('_', ' ')}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                      {log.resource_type.replace('_', ' ')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.metadata?.amount && `Amount: $${log.metadata.amount}`}
                      {log.resource_id && ` ID: ${log.resource_id.substring(0, 8)}...`}
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

export default FinanceAuditLog;
