import React from 'react';
import { useCRM } from '@/context/CRMContext';
import CompactMetricsBar from '@/components/dashboard/CompactMetricsBar';
import CompactWelcomeHeader from '@/components/dashboard/CompactWelcomeHeader';
import StreamlinedChart from '@/components/dashboard/StreamlinedChart';
import UnifiedActivityStream from '@/components/dashboard/UnifiedActivityStream';
import CompactQuickActions from '@/components/dashboard/CompactQuickActions';
import EnhancedProfileCompletionTracker from '@/components/workstation/EnhancedProfileCompletionTracker';
import UserWorkstation from '@/components/workstation/UserWorkstation';
import FirstTimeOnboardingModal from '@/components/onboarding/FirstTimeOnboardingModal';
import { generateMonthlyActivityData } from '@/utils/chart-utils';

const Dashboard = () => {
  const { customers } = useCRM();
  
  // Count customers by status
  const newCustomers = customers.filter(c => c.status === 'new').length;
  const existingCustomers = customers.filter(c => c.status === 'existing').length;
  const pendingCustomers = customers.filter(c => c.status === 'pending').length;
  const finalisedCustomers = customers.filter(c => c.status === 'finalised').length;
  
  // Generate monthly data from actual customer records
  const chartData = generateMonthlyActivityData(customers);

  return (
    <div className="space-y-6 p-1">
      {/* First-time onboarding modal */}
      <FirstTimeOnboardingModal />
      
      {/* Compact Welcome Header */}
      <CompactWelcomeHeader />

      {/* Compact Metrics Bar with Sparklines */}
      <CompactMetricsBar
        newCustomers={newCustomers}
        existingCustomers={existingCustomers}
        pendingCustomers={pendingCustomers}
        finalisedCustomers={finalisedCustomers}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <StreamlinedChart data={chartData} />
        </div>
        
        {/* Quick Actions - Takes 1 column */}
        <div>
          <CompactQuickActions />
        </div>
      </div>

      {/* Activity and Tools Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unified Activity Stream - Takes 2 columns */}
        <div className="lg:col-span-2">
          <UnifiedActivityStream customers={customers} />
        </div>
        
        {/* Profile + Workstation - Takes 1 column */}
        <div className="space-y-4">
          <EnhancedProfileCompletionTracker />
          <UserWorkstation />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
