
import React from 'react';

interface Customer {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

interface RecentActivityProps {
  customers: Customer[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ customers }) => {
  const recentCustomers = customers.slice(0, 5);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {recentCustomers.map((customer) => (
          <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium">{customer.name}</p>
              <p className="text-sm text-gray-600">{customer.email}</p>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(customer.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
