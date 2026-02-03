import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Ticket, 
  BarChart3, 
  ChevronDown,
  ChevronUp,
  FileText,
  Search,
  Calendar,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  title: string;
  icon: React.ReactNode;
  action: () => void;
  primary?: boolean;
}

const CompactQuickActions = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const primaryActions: QuickAction[] = [
    {
      id: 'add-customer',
      title: 'Add Client',
      icon: <UserPlus className="h-4 w-4" />,
      action: () => navigate('/customers'),
      primary: true
    },
    {
      id: 'create-ticket',
      title: 'New Ticket',
      icon: <Ticket className="h-4 w-4" />,
      action: () => navigate('/customers'),
      primary: true
    },
    {
      id: 'view-analytics',
      title: 'Analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => navigate('/analytics'),
      primary: true
    },
  ];

  const secondaryActions: QuickAction[] = [
    {
      id: 'generate-report',
      title: 'Generate Report',
      icon: <FileText className="h-4 w-4" />,
      action: () => navigate('/analytics'),
    },
    {
      id: 'search',
      title: 'Search Clients',
      icon: <Search className="h-4 w-4" />,
      action: () => navigate('/customers'),
    },
    {
      id: 'schedule',
      title: 'Schedule',
      icon: <Calendar className="h-4 w-4" />,
      action: () => console.log('Schedule feature coming soon!'),
    },
  ];

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 h-full">
      <CardHeader className="pb-3 space-y-0">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">Quick Actions</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Primary Actions */}
        <div className="grid grid-cols-3 gap-2">
          {primaryActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className={cn(
                "h-auto py-3 flex flex-col items-center gap-1.5 bg-muted/30 hover:bg-primary hover:text-primary-foreground border-border/50 transition-all group"
              )}
              onClick={action.action}
            >
              <div className="p-1.5 rounded-md bg-muted group-hover:bg-primary-foreground/10">
                {action.icon}
              </div>
              <span className="text-xs font-medium">{action.title}</span>
            </Button>
          ))}
        </div>

        {/* Expandable Secondary Actions */}
        <div className={cn(
          "space-y-2 overflow-hidden transition-all duration-200",
          isExpanded ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="border-t border-border/50 pt-3">
            <div className="grid grid-cols-3 gap-2">
              {secondaryActions.map((action) => (
                <Button
                  key={action.id}
                  variant="ghost"
                  size="sm"
                  className="h-auto py-2 flex flex-col items-center gap-1 hover:bg-muted/50"
                  onClick={action.action}
                >
                  {action.icon}
                  <span className="text-xs text-muted-foreground">{action.title}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-7 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3 mr-1" />
              Less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3 mr-1" />
              More actions
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CompactQuickActions;
