
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Customer } from '@/context/CRMContext';

interface RecentActivityProps {
  customers: Customer[];
}

const RecentActivity = ({ customers }: RecentActivityProps) => {
  // Get the 5 most recently updated customers
  const recentActivity = [...customers]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'existing':
        return 'bg-teal-100 text-teal-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'finalised':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Card className="shadow-sm h-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.map((customer) => (
            <div key={customer.id} className="flex items-center gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                {customer.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{customer.name}</p>
                <p className="text-sm text-gray-500 truncate">{customer.email}</p>
              </div>
              <div className="flex-shrink-0">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(customer.status)}`}>
                  {customer.status}
                </span>
              </div>
              <div className="flex-shrink-0 text-xs text-gray-500">
                {formatDate(customer.updatedAt)}
              </div>
            </div>
          ))}

          {recentActivity.length === 0 && (
            <p className="text-center text-gray-500">No recent activity</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
