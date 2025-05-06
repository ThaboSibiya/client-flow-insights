
import React from 'react';
import { useCRM } from '@/context/CRMContext';
import StatusCard from '@/components/dashboard/StatusCard';
import CustomerActivityChart from '@/components/dashboard/CustomerActivityChart';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { Users, ChartBar, CircleCheck, Database } from 'lucide-react';

const Dashboard = () => {
  const { customers } = useCRM();
  
  // Count customers by status
  const newCustomers = customers.filter(c => c.status === 'new').length;
  const existingCustomers = customers.filter(c => c.status === 'existing').length;
  const pendingCustomers = customers.filter(c => c.status === 'pending').length;
  const finalisedCustomers = customers.filter(c => c.status === 'finalised').length;
  
  // Sample data for the chart
  const chartData = [
    {
      name: 'Jan',
      new: 4,
      existing: 3,
      pending: 2,
      finalised: 1,
    },
    {
      name: 'Feb',
      new: 3,
      existing: 4,
      pending: 3,
      finalised: 2,
    },
    {
      name: 'Mar',
      new: 5,
      existing: 2,
      pending: 4,
      finalised: 3,
    },
    {
      name: 'Apr',
      new: 2,
      existing: 6,
      pending: 1,
      finalised: 4,
    },
    {
      name: 'May',
      new: 3,
      existing: 4,
      pending: 5,
      finalised: 2,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard 
          title="New Customers" 
          count={newCustomers} 
          icon={<Users size={24} className="text-white" />} 
          color="bg-broker-accent"
        />
        <StatusCard 
          title="Existing Customers" 
          count={existingCustomers} 
          icon={<Database size={24} className="text-white" />} 
          color="bg-broker-secondary"
        />
        <StatusCard 
          title="Pending Policies" 
          count={pendingCustomers} 
          icon={<ChartBar size={24} className="text-white" />} 
          color="bg-orange-500"
        />
        <StatusCard 
          title="Finalised Sales" 
          count={finalisedCustomers} 
          icon={<CircleCheck size={24} className="text-white" />} 
          color="bg-green-500"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CustomerActivityChart data={chartData} />
        </div>
        <div>
          <RecentActivity customers={customers} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
