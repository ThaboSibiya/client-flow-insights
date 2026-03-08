
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
  const recentActivity = [...customers]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30';
      case 'existing':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30';
      case 'pending':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30';
      case 'finalised':
        return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30';
      default:
        return 'bg-muted text-muted-foreground border border-border';
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
    <Card className="shadow-md h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <ScrollArea className="h-[250px] pr-4">
          <div className="space-y-4">
            {recentActivity.map((customer) => (
              <div key={customer.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm text-sm font-medium">
                  {customer.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="font-medium text-foreground truncate max-w-[120px] sm:max-w-[150px] md:max-w-[180px]">
                          {customer.name}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent side="top">{customer.name}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[150px] md:max-w-[180px]">
                          {customer.email}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent side="top">{customer.email}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${getStatusColor(customer.status)}`}>
                    {customer.status}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(customer.updatedAt)}
                  </span>
                </div>
              </div>
            ))}

            {recentActivity.length === 0 && (
              <p className="text-center text-muted-foreground">No recent activity</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
