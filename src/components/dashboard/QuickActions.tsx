
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
      title: 'Add Customer',
      description: 'Create a new customer record',
      icon: <UserPlus className="h-5 w-5" />,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      action: () => navigate('/customers')
    },
    {
      id: 'create-ticket',
      title: 'New Ticket',
      description: 'Create a support ticket',
      icon: <Ticket className="h-5 w-5" />,
      color: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
      action: () => navigate('/customers')
    },
    {
      id: 'view-analytics',
      title: 'Analytics',
      description: 'View performance reports',
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      action: () => navigate('/analytics')
    },
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Export customer data',
      icon: <FileText className="h-5 w-5" />,
      color: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      action: () => navigate('/analytics')
    },
    {
      id: 'search-customers',
      title: 'Search',
      description: 'Find customers quickly',
      icon: <Search className="h-5 w-5" />,
      color: 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700',
      action: () => navigate('/customers')
    },
    {
      id: 'schedule-followup',
      title: 'Schedule',
      description: 'Plan follow-up tasks',
      icon: <Calendar className="h-5 w-5" />,
      color: 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700',
      action: () => console.log('Schedule feature coming soon!')
    }
  ];

  return (
    <Card className="shadow-md bg-gradient-to-br from-white to-gray-50 border-gray-200/70">
      <CardHeader className="pb-3 border-b border-gray-100">
        <CardTitle className="flex items-center gap-2 text-broker-primary">
          <Settings className="h-5 w-5 text-broker-accent" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className={`h-auto p-4 flex flex-col items-center gap-2 text-white border-0 ${action.color} transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg`}
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
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button
            variant="ghost" 
            size="sm"
            className="w-full text-gray-600 hover:text-broker-primary"
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
