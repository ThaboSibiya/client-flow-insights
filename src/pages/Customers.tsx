
import React from 'react';
import CustomerTable from '@/components/customers/CustomerTable';

const Customers = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customer Management</h1>
      <CustomerTable />
    </div>
  );
};

export default Customers;
