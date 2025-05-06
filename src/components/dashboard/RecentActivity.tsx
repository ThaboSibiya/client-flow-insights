
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
        return 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200';
      case 'existing':
        return 'bg-gradient-to-r from-teal-100 to-teal-50 text-teal-800 border border-teal-200';
      case 'pending':
        return 'bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border border-amber-200';
      case 'finalised':
        return 'bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-800 border border-emerald-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200';
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
    <Card className="shadow-md h-full bg-gradient-to-br from-white to-gray-50 border-gray-200/70">
      <CardHeader className="pb-2 border-b border-gray-100">
        <CardTitle className="flex items-center gap-2 text-broker-primary">
          <Clock className="h-5 w-5 text-broker-accent" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ScrollArea className="h-[250px] pr-4">
          <div className="space-y-4">
            {recentActivity.map((customer) => (
              <div key={customer.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-broker-primary to-broker-accent text-white flex items-center justify-center shadow-sm">
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
                  <span className={`text-xs px-3 py-1 rounded-full whitespace-nowrap shadow-sm ${getStatusColor(customer.status)}`}>
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
