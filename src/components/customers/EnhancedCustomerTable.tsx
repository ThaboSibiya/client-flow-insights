import React from 'react';
import { Customer } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Edit, Trash2, Eye } from 'lucide-react';
import { SkeletonTable } from '@/components/common/SkeletonScreens';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import { AccessibleButton } from '@/components/common/AccessibleComponents';

interface EnhancedCustomerTableProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (customerId: string) => void;
  onView: (customer: Customer) => void;
  loading?: boolean;
}

const EnhancedCustomerTable: React.FC<EnhancedCustomerTableProps> = ({ 
  customers, 
  onEdit, 
  onDelete, 
  onView,
  loading = false 
}) => {
  if (loading) {
    return <SkeletonTable rows={5} columns={6} />;
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'new': return 'default';
      case 'existing': return 'secondary';
      case 'pending': return 'outline';
      case 'finalised': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <ErrorBoundary>
      <div className="overflow-x-auto">
        <Table role="table" aria-label="Customer information table">
          <TableHeader>
            <TableRow role="row">
              <TableHead role="columnheader">Name</TableHead>
              <TableHead role="columnheader">Email</TableHead>
              <TableHead role="columnheader">Phone</TableHead>
              <TableHead role="columnheader">Status</TableHead>
              <TableHead role="columnheader">Created</TableHead>
              <TableHead className="sr-only" role="columnheader">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow role="row">
                <TableCell 
                  colSpan={6} 
                  className="text-center py-8 text-muted-foreground"
                  role="gridcell"
                >
                  No customers found
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow 
                  key={customer.id}
                  role="row"
                  className="hover:bg-muted/50 focus-within:bg-muted/50"
                >
                  <TableCell className="font-medium" role="gridcell">
                    {customer.name}
                  </TableCell>
                  <TableCell role="gridcell">
                    <a 
                      href={`mailto:${customer.email}`}
                      className="text-primary hover:underline focus:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                      aria-label={`Email ${customer.name} at ${customer.email}`}
                    >
                      {customer.email}
                    </a>
                  </TableCell>
                  <TableCell role="gridcell">
                    <a 
                      href={`tel:${customer.phone}`}
                      className="text-primary hover:underline focus:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
                      aria-label={`Call ${customer.name} at ${customer.phone}`}
                    >
                      {customer.phone}
                    </a>
                  </TableCell>
                  <TableCell role="gridcell">
                    <Badge 
                      variant={getStatusVariant(customer.status)}
                      aria-label={`Customer status: ${customer.status}`}
                    >
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell role="gridcell">
                    <time dateTime={customer.createdAt.toISOString()}>
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </time>
                  </TableCell>
                  <TableCell role="gridcell">
                    <div className="flex items-center space-x-1" role="group" aria-label={`Actions for ${customer.name}`}>
                      <AccessibleButton
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(customer)}
                        aria-label={`View ${customer.name} details`}
                      >
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      </AccessibleButton>
                      
                      <AccessibleButton
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(customer)}
                        aria-label={`Edit ${customer.name}`}
                      >
                        <Edit className="h-4 w-4" aria-hidden="true" />
                      </AccessibleButton>
                      
                      <AccessibleButton
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete ${customer.name}?`)) {
                            onDelete(customer.id);
                          }
                        }}
                        aria-label={`Delete ${customer.name}`}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </AccessibleButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </ErrorBoundary>
  );
};

export default EnhancedCustomerTable;