import React from 'react';
import { useCRM } from '@/context/CRMContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  MessageCircle, 
  DollarSign, 
  FileText, 
  TrendingUp,
  ArrowRight,
  Plus,
  Bot
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { PullToRefresh, MobileCard } from '@/components/mobile';
import { cn } from '@/lib/utils';
import FirstTimeOnboardingModal from '@/components/onboarding/FirstTimeOnboardingModal';
import { useConversationsOptimized } from '@/hooks/useConversationsOptimized';

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  badge?: number;
  variant?: 'default' | 'primary';
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, label, onClick, badge, variant = 'default' }) => (
  <button
    onClick={onClick}
    className={cn(
      'flex flex-col items-center justify-center p-4 rounded-xl min-w-[80px] transition-all active:scale-95',
      variant === 'primary' 
        ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md' 
        : 'bg-card border border-border/50'
    )}
  >
    <div className="relative">
      {icon}
      {badge && badge > 0 && (
        <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] font-bold bg-destructive text-white rounded-full flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </div>
    <span className="text-[10px] font-medium mt-1.5 text-center leading-tight">{label}</span>
  </button>
);

interface StatCardProps {
  label: string;
  value: number;
  trend?: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, trend, color }) => (
  <Card className="flex-shrink-0 w-[140px] overflow-hidden">
    <CardContent className="p-3">
      <div className={cn('h-1 w-8 rounded-full mb-2', color)} />
      <p className="text-2xl font-bold">{value}</p>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        {trend !== undefined && (
          <span className={cn(
            'text-[10px] font-medium',
            trend >= 0 ? 'text-green-500' : 'text-red-500'
          )}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </CardContent>
  </Card>
);

const MobileDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { customers } = useCRM();
  const { unreadCount } = useConversationsOptimized();

  const stats = {
    new: customers.filter(c => c.status === 'new').length,
    existing: customers.filter(c => c.status === 'existing').length,
    pending: customers.filter(c => c.status === 'pending').length,
    total: customers.length,
  };

  const handleRefresh = async () => {
    // Refresh happens via context, just wait a moment for visual feedback
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const quickActions = [
    { icon: <Plus className="h-6 w-6" />, label: 'New Client', onClick: () => navigate('/onboarding'), variant: 'primary' as const },
    { icon: <Users className="h-5 w-5" />, label: 'Clients', onClick: () => navigate('/customers') },
    { icon: <MessageCircle className="h-5 w-5" />, label: 'Messages', onClick: () => navigate('/conversations'), badge: unreadCount },
    { icon: <Bot className="h-5 w-5" />, label: 'Pipeline', onClick: () => navigate('/pipeline') },
    { icon: <FileText className="h-5 w-5" />, label: 'Quotes', onClick: () => navigate('/quotes') },
    { icon: <DollarSign className="h-5 w-5" />, label: 'Finance', onClick: () => navigate('/finance') },
  ];

  // Get recent customers for activity
  const recentCustomers = [...customers]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col h-full pb-20">
      <FirstTimeOnboardingModal />
      
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-5 pb-6">
          {/* Greeting */}
          <div className="px-4 pt-2">
            <h1 className="text-xl font-bold text-foreground">Welcome back!</h1>
            <p className="text-sm text-muted-foreground">Here's your business overview</p>
          </div>

          {/* Stats Carousel */}
          <ScrollArea className="w-full">
            <div className="flex gap-3 px-4 pb-2">
              <StatCard label="New Clients" value={stats.new} trend={12} color="bg-blue-500" />
              <StatCard label="Existing" value={stats.existing} trend={5} color="bg-green-500" />
              <StatCard label="Pending" value={stats.pending} trend={-3} color="bg-yellow-500" />
              <StatCard label="Total" value={stats.total} color="bg-primary" />
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Quick Actions Grid */}
          <div className="px-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h2>
            <div className="grid grid-cols-4 gap-2">
              {quickActions.slice(0, 4).map((action, i) => (
                <QuickAction key={i} {...action} />
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {quickActions.slice(4).map((action, i) => (
                <QuickAction key={i} {...action} />
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="px-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">Recent Clients</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-primary gap-1 h-7"
                onClick={() => navigate('/customers')}
              >
                View all
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            
            <Card className="overflow-hidden">
              {recentCustomers.length === 0 ? (
                <div className="p-6 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No clients yet</p>
                  <Button 
                    size="sm" 
                    className="mt-3"
                    onClick={() => navigate('/onboarding')}
                  >
                    Add your first client
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {recentCustomers.map((customer) => (
                    <MobileCard
                      key={customer.id}
                      title={customer.name}
                      subtitle={customer.email}
                      avatar={{
                        fallback: customer.name.slice(0, 2).toUpperCase(),
                      }}
                      badges={[
                        { 
                          label: customer.status || 'new', 
                          variant: customer.status === 'existing' ? 'default' : 'secondary' 
                        }
                      ]}
                      onClick={() => navigate('/customers')}
                      showChevron
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Insights Teaser */}
          <div className="px-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Business Insights</p>
                  <p className="text-xs text-muted-foreground">
                    View detailed analytics and reports
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => navigate('/analytics')}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </PullToRefresh>
    </div>
  );
};

export default MobileDashboard;
