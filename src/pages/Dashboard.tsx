import React, { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import StatusCard from '@/components/dashboard/StatusCard';
import CustomerActivityChart from '@/components/dashboard/CustomerActivityChart';
import RecentActivity from '@/components/dashboard/RecentActivity';
import DashboardLayoutManager from '@/components/dashboard/DashboardLayoutManager';
import RealtimeActivityFeed from '@/components/dashboard/RealtimeActivityFeed';
import QuickActions from '@/components/dashboard/QuickActions';
import InteractiveMetrics from '@/components/dashboard/InteractiveMetrics';
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
      <div className="bg-gradient-to-r from-quikle-primary/20 via-quikle-accent/15 to-quikle-secondary/20 p-2 rounded-md mb-2 shadow-lg border border-white/20 backdrop-blur-sm quikle-card">
        <h1 className="text-lg font-bold text-gradient-quikle drop-shadow-sm">Dashboard Overview</h1>
        <p className="text-quikle-slate text-xs opacity-80">Monitor your business performance at a glance</p>
      </div>

      <DashboardLayoutManager 
        isEditMode={isEditMode} 
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
      >
        {/* Status Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

        {/* Interactive Widgets Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <CustomerActivityChart data={chartData} />
          </div>
          <div>
            <InteractiveMetrics />
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
