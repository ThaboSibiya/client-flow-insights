
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Customer } from '@/context/CRMContext';
import { Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

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
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-500" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[250px] pr-4">
          <div className="space-y-4">
            {recentActivity.map((customer) => (
              <div key={customer.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  {customer.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="font-medium text-gray-900 truncate max-w-[120px] sm:max-w-[150px] md:max-w-[180px]">
                          {customer.name}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent side="top">{customer.name}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-[150px] md:max-w-[180px]">
                          {customer.email}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent side="top">{customer.email}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${getStatusColor(customer.status)}`}>
                    {customer.status}
                  </span>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(customer.updatedAt)}
                  </span>
                </div>
              </div>
            ))}

            {recentActivity.length === 0 && (
              <p className="text-center text-gray-500">No recent activity</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
