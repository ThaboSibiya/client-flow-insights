import React, { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import StatusCard from '@/components/dashboard/StatusCard';
import CustomerActivityChart from '@/components/dashboard/CustomerActivityChart';
import RecentActivity from '@/components/dashboard/RecentActivity';
import DashboardLayoutManager from '@/components/dashboard/DashboardLayoutManager';
import RealtimeActivityFeed from '@/components/dashboard/RealtimeActivityFeed';
import QuickActions from '@/components/dashboard/QuickActions';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import UserWorkstation from '@/components/workstation/UserWorkstation';
import ProfileCompletionTracker from '@/components/workstation/ProfileCompletionTracker';
import FirstTimeOnboardingModal from '@/components/onboarding/FirstTimeOnboardingModal';
import TourTrigger from '@/components/tour/TourTrigger';
import { Users, Clock, CircleCheck, Database } from 'lucide-react';
import { generateMonthlyActivityData } from '@/utils/chart-utils';

const Dashboard = () => {
  const { customers } = useCRM();
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Count customers by status
  const newCustomers = customers.filter(c => c.status === 'new').length;
  const existingCustomers = customers.filter(c => c.status === 'existing').length;
  const pendingCustomers = customers.filter(c => c.status === 'pending').length;
  const finalisedCustomers = customers.filter(c => c.status === 'finalised').length;
  
  // Generate monthly data from actual customer records
  const chartData = generateMonthlyActivityData(customers);

  return (
    <div className="space-y-6">
      {/* First-time onboarding modal */}
      <FirstTimeOnboardingModal />
      
      <div className="flex items-center justify-between" data-tour="welcome-header">
        <WelcomeHeader subtitle="Monitor your business performance at a glance" />
        <TourTrigger tourId="dashboard" variant="button" />
      </div>

      <DashboardLayoutManager 
        isEditMode={isEditMode} 
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
      >
        {/* Status Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" data-tour="status-cards">
          <StatusCard 
            title="New Customers" 
            count={newCustomers} 
            icon={<Users size={24} className="text-white" />} 
            color="bg-gradient-to-br from-quikle-primary to-quikle-accent"
          />
          <StatusCard 
            title="Existing Customers" 
            count={existingCustomers} 
            icon={<Database size={24} className="text-white" />} 
            color="bg-gradient-to-br from-quikle-blue to-quikle-secondary"
          />
          <StatusCard 
            title="Pending Customers" 
            count={pendingCustomers} 
            icon={<Clock size={24} className="text-white" />} 
            color="bg-gradient-to-br from-quikle-purple to-quikle-accent"
          />
          <StatusCard 
            title="Finalised Deals" 
            count={finalisedCustomers} 
            icon={<CircleCheck size={24} className="text-white" />} 
            color="bg-gradient-to-br from-quikle-success to-emerald-600"
          />
        </div>

        {/* User Workstation + Chart Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2" data-tour="activity-chart">
            <CustomerActivityChart data={chartData} />
          </div>
          <div className="space-y-4">
            <div data-tour="profile-tracker">
              <ProfileCompletionTracker />
            </div>
            <div data-tour="workstation">
              <UserWorkstation />
            </div>
          </div>
        </div>

        {/* Activity and Actions Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <RealtimeActivityFeed />
          </div>
          <div>
            <RecentActivity customers={customers} />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>
      </DashboardLayoutManager>
    </div>
  );
};

export default Dashboard;
