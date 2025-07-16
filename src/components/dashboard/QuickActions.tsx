
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Ticket, 
  BarChart3, 
  FileText, 
  Search, 
  Calendar,
  Mail,
  Settings
} from 'lucide-react';

const QuickActions = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 'add-customer',
      title: 'Add Client',
      description: 'Create a new client record',
      icon: <UserPlus className="h-5 w-5" />,
      color: 'bg-gradient-to-r from-quikle-primary to-quikle-secondary hover:from-quikle-secondary hover:to-quikle-primary',
      action: () => navigate('/customers')
    },
    {
      id: 'create-ticket',
      title: 'New Ticket',
      description: 'Create a support ticket',
      icon: <Ticket className="h-5 w-5" />,
      color: 'bg-gradient-to-r from-quikle-info to-quikle-blue hover:from-quikle-blue hover:to-quikle-info',
      action: () => navigate('/customers')
    },
    {
      id: 'view-analytics',
      title: 'Analytics',
      description: 'View performance reports',
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'bg-gradient-to-r from-quikle-purple to-quikle-accent hover:from-quikle-accent hover:to-quikle-purple',
      action: () => navigate('/analytics')
    },
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Export business data',
      icon: <FileText className="h-5 w-5" />,
      color: 'bg-gradient-to-r from-quikle-success to-emerald-600 hover:from-emerald-600 hover:to-quikle-success',
      action: () => navigate('/analytics')
    },
    {
      id: 'search-customers',
      title: 'Search',
      description: 'Find clients quickly',
      icon: <Search className="h-5 w-5" />,
      color: 'bg-gradient-to-r from-quikle-slate to-quikle-stone hover:from-quikle-stone hover:to-quikle-slate',
      action: () => navigate('/customers')
    },
    {
      id: 'schedule-followup',
      title: 'Schedule',
      description: 'Plan follow-up tasks',
      icon: <Calendar className="h-5 w-5" />,
      color: 'bg-gradient-to-r from-indigo-500 to-quikle-blue hover:from-quikle-blue hover:to-indigo-500',
      action: () => console.log('Schedule feature coming soon!')
    }
  ];

  return (
    <Card className="shadow-platinum glass-effect border-quikle-silver/20">
      <CardHeader className="pb-3 border-b border-quikle-silver/20">
        <CardTitle className="flex items-center gap-2 luxury-text">
          <Settings className="h-5 w-5 text-quikle-accent" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className={`h-auto p-4 flex flex-col items-center gap-2 text-white border-0 ${action.color} transform hover:scale-105 transition-all duration-300 shadow-platinum hover:shadow-luxury`}
              onClick={action.action}
            >
              {action.icon}
              <div className="text-center">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs opacity-90">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-quikle-silver/20">
          <Button
            variant="ghost" 
            size="sm"
            className="w-full text-quikle-slate hover:text-quikle-primary hover:bg-quikle-primary/5"
            onClick={() => navigate('/onboarding')}
          >
            <Mail className="h-4 w-4 mr-2" />
            View Onboarding Tools
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
