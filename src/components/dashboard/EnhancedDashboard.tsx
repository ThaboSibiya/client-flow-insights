import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { SkeletonDashboard, SkeletonCard } from '@/components/common/SkeletonScreens';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import { AccessibleStatus, SkipLink } from '@/components/common/AccessibleComponents';

// Lazy load heavy components
const Analytics = React.lazy(() => import('@/components/analytics/ChurnRateAnalysis'));
const RecentActivity = React.lazy(() => import('@/components/common/RecentActivity'));

interface DashboardStats {
  totalCustomers: number;
  activeTickets: number;
  monthlyRevenue: number;
  upcomingTasks: number;
}

interface EnhancedDashboardProps {
  stats?: DashboardStats;
  loading?: boolean;
  error?: string;
}

const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({ 
  stats, 
  loading = false, 
  error 
}) => {
  // Loading state with skeleton
  if (loading) {
    return <SkeletonDashboard />;
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <AccessibleStatus 
          type="error" 
          message={error}
          dismissible
          onDismiss={() => window.location.reload()}
        />
      </div>
    );
  }

  const defaultStats: DashboardStats = {
    totalCustomers: stats?.totalCustomers ?? 0,
    activeTickets: stats?.activeTickets ?? 0,
    monthlyRevenue: stats?.monthlyRevenue ?? 0,
    upcomingTasks: stats?.upcomingTasks ?? 0,
  };

  const statCards = [
    {
      title: 'Total Customers',
      value: defaultStats.totalCustomers.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      ariaLabel: `${defaultStats.totalCustomers} total customers`,
    },
    {
      title: 'Active Tickets',
      value: defaultStats.activeTickets.toLocaleString(),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      ariaLabel: `${defaultStats.activeTickets} active support tickets`,
    },
    {
      title: 'Monthly Revenue',
      value: `$${defaultStats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      ariaLabel: `$${defaultStats.monthlyRevenue.toLocaleString()} in monthly revenue`,
    },
    {
      title: 'Upcoming Tasks',
      value: defaultStats.upcomingTasks.toLocaleString(),
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      ariaLabel: `${defaultStats.upcomingTasks} upcoming tasks`,
    },
  ];

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-6">
        <SkipLink href="#dashboard-stats">Skip to dashboard statistics</SkipLink>
        
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's what's happening with your business today.
          </p>
        </header>

        {/* Stats Grid */}
        <section 
          id="dashboard-stats"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8"
          aria-labelledby="stats-heading"
        >
          <h2 id="stats-heading" className="sr-only">
            Key Business Statistics
          </h2>
          
          {statCards.map((stat, index) => (
            <Card 
              key={stat.title}
              className="hover:shadow-md transition-shadow"
              role="region"
              aria-labelledby={`stat-${index}-title`}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon 
                      className={`h-6 w-6 ${stat.color}`} 
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p 
                      id={`stat-${index}-title`}
                      className="text-sm font-medium text-gray-600"
                    >
                      {stat.title}
                    </p>
                    <p 
                      className="text-2xl font-bold text-gray-900"
                      aria-label={stat.ariaLabel}
                    >
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Charts and Analytics */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <section aria-labelledby="analytics-heading">
            <h2 id="analytics-heading" className="sr-only">
              Analytics and Trends
            </h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<SkeletonCard />}>
                  <ErrorBoundary 
                    fallback={
                      <AccessibleStatus 
                        type="warning" 
                        message="Unable to load analytics. Please try refreshing." 
                      />
                    }
                  >
                    <Analytics />
                  </ErrorBoundary>
                </Suspense>
              </CardContent>
            </Card>
          </section>

          <section aria-labelledby="activity-heading">
            <h2 id="activity-heading" className="sr-only">
              Recent Activity
            </h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<SkeletonCard />}>
                  <ErrorBoundary 
                    fallback={
                      <AccessibleStatus 
                        type="warning" 
                        message="Unable to load recent activity. Please try refreshing." 
                      />
                    }
                  >
                    <RecentActivity />
                  </ErrorBoundary>
                </Suspense>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Quick Actions */}
        <section 
          className="mt-8"
          aria-labelledby="quick-actions-heading"
        >
          <h2 id="quick-actions-heading" className="text-xl font-semibold mb-4">
            Quick Actions
          </h2>
          
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" aria-hidden="true" />
                <h3 className="font-medium">Add Customer</h3>
                <p className="text-sm text-gray-600">Create a new customer record</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" aria-hidden="true" />
                <h3 className="font-medium">New Ticket</h3>
                <p className="text-sm text-gray-600">Create a support ticket</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-purple-600" aria-hidden="true" />
                <h3 className="font-medium">Generate Quote</h3>
                <p className="text-sm text-gray-600">Create a new quote</p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </ErrorBoundary>
  );
};

export default EnhancedDashboard;