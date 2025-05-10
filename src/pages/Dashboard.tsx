
import React, { useState } from 'react';
import { useCRM } from '@/context/CRMContext';
import StatusCard from '@/components/dashboard/StatusCard';
import CustomerActivityChart from '@/components/dashboard/CustomerActivityChart';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { Users, ChartBar, CircleCheck, Database } from 'lucide-react';
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
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-broker-primary/20 via-broker-secondary/15 to-broker-accent/20 p-8 rounded-xl mb-6 shadow-lg border border-white/20 backdrop-blur-sm">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-broker-primary via-broker-secondary to-broker-accent bg-clip-text text-transparent drop-shadow-sm">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Monitor your business performance at a glance</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard 
          title="New Customers" 
          count={newCustomers} 
          icon={<Users size={24} className="text-white" />} 
          color="bg-gradient-to-br from-broker-accent to-blue-500"
        />
        <StatusCard 
          title="Existing Customers" 
          count={existingCustomers} 
          icon={<Database size={24} className="text-white" />} 
          color="bg-gradient-to-br from-broker-secondary to-cyan-500"
        />
        <StatusCard 
          title="Pending Policies" 
          count={pendingCustomers} 
          icon={<ChartBar size={24} className="text-white" />} 
          color="bg-gradient-to-br from-orange-400 to-amber-600"
        />
        <StatusCard 
          title="Finalised Sales" 
          count={finalisedCustomers} 
          icon={<CircleCheck size={24} className="text-white" />} 
          color="bg-gradient-to-br from-green-400 to-emerald-600"
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
