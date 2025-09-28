import React, { memo, useMemo, useCallback } from 'react';
import { Customer } from '@/types/customer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Eye, Users, TrendingUp, Activity } from 'lucide-react';

// Memoized customer card component
interface CustomerCardProps {
  customer: Customer;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  onView: (customer: Customer) => void;
  highlightText?: (text: string, query: string) => string | React.ReactNode[];
  searchQuery?: string;
}

export const MemoizedCustomerCard = memo<CustomerCardProps>(({
  customer,
  onEdit,
  onDelete,
  onView,
  highlightText,
  searchQuery = '',
}) => {
  const handleEdit = useCallback(() => onEdit(customer), [onEdit, customer]);
  const handleDelete = useCallback(() => onDelete(customer.id), [onDelete, customer.id]);
  const handleView = useCallback(() => onView(customer), [onView, customer]);

  const statusVariant = useMemo(() => {
    switch (customer.status) {
      case 'new': return 'default';
      case 'existing': return 'secondary';
      case 'pending': return 'outline';
      case 'finalised': return 'destructive';
      default: return 'secondary';
    }
  }, [customer.status]);

  const highlightedName = useMemo(() => {
    return highlightText ? highlightText(customer.name, searchQuery) : customer.name;
  }, [highlightText, customer.name, searchQuery]);

  const highlightedEmail = useMemo(() => {
    return highlightText ? highlightText(customer.email, searchQuery) : customer.email;
  }, [highlightText, customer.email, searchQuery]);

  const highlightedPhone = useMemo(() => {
    return highlightText ? highlightText(customer.phone, searchQuery) : customer.phone;
  }, [highlightText, customer.phone, searchQuery]);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {typeof highlightedName === 'string' ? (
              highlightedName
            ) : (
              highlightedName
            )}
          </CardTitle>
          <Badge variant={statusVariant}>
            {customer.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {typeof highlightedEmail === 'string' ? (
              highlightedEmail
            ) : (
              highlightedEmail
            )}
          </p>
          
          <p className="text-sm text-muted-foreground">
            {typeof highlightedPhone === 'string' ? (
              highlightedPhone
            ) : (
              highlightedPhone
            )}
          </p>
          
          {customer.contact_person && (
            <p className="text-sm text-muted-foreground">
              Contact: {customer.contact_person}
            </p>
          )}
          
          <div className="flex justify-between items-center pt-2">
            <span className="text-xs text-muted-foreground">
              {customer.ticketCount || 0} tickets
            </span>
            
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleView}
                aria-label={`View ${customer.name}`}
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                aria-label={`Edit ${customer.name}`}
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                aria-label={`Delete ${customer.name}`}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

MemoizedCustomerCard.displayName = 'MemoizedCustomerCard';

// Memoized stats card component
interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

export const MemoizedStatsCard = memo<StatsCardProps>(({ title, value, icon, color }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-2">
          <div className={color}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

MemoizedStatsCard.displayName = 'MemoizedStatsCard';

// Memoized customer stats component
interface CustomerStatsProps {
  customers: Customer[];
}

export const MemoizedCustomerStats = memo<CustomerStatsProps>(({ customers }) => {
  const stats = useMemo(() => {
    const total = customers.length;
    const byStatus = customers.reduce((acc, customer) => {
      acc[customer.status] = (acc[customer.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      new: byStatus.new || 0,
      existing: byStatus.existing || 0,
      pending: byStatus.pending || 0,
      finalised: byStatus.finalised || 0,
      withTickets: customers.filter(c => (c.ticketCount || 0) > 0).length,
    };
  }, [customers]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <MemoizedStatsCard
        title="Total"
        value={stats.total}
        icon={<Users className="h-4 w-4" />}
        color="text-blue-600"
      />
      
      <MemoizedStatsCard
        title="New"
        value={stats.new}
        icon={<TrendingUp className="h-4 w-4" />}
        color="text-green-600"
      />
      
      <MemoizedStatsCard
        title="Existing"
        value={stats.existing}
        icon={<Users className="h-4 w-4" />}
        color="text-purple-600"
      />
      
      <MemoizedStatsCard
        title="Pending"
        value={stats.pending}
        icon={<Activity className="h-4 w-4" />}
        color="text-orange-600"
      />
      
      <MemoizedStatsCard
        title="Finalised"
        value={stats.finalised}
        icon={<Users className="h-4 w-4" />}
        color="text-gray-600"
      />
      
      <MemoizedStatsCard
        title="With Tickets"
        value={stats.withTickets}
        icon={<Activity className="h-4 w-4" />}
        color="text-red-600"
      />
    </div>
  );
});

MemoizedCustomerStats.displayName = 'MemoizedCustomerStats';

// Memoized customer list component
interface CustomerListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  onView: (customer: Customer) => void;
  highlightText?: (text: string, query: string) => string | React.ReactNode[];
  searchQuery?: string;
}

export const MemoizedCustomerList = memo<CustomerListProps>(({
  customers,
  onEdit,
  onDelete,
  onView,
  highlightText,
  searchQuery,
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {customers.map((customer) => (
        <MemoizedCustomerCard
          key={customer.id}
          customer={customer}
          onEdit={onEdit}
          onDelete={onDelete}
          onView={onView}
          highlightText={highlightText}
          searchQuery={searchQuery}
        />
      ))}
    </div>
  );
});

MemoizedCustomerList.displayName = 'MemoizedCustomerList';