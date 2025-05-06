
import React from 'react';
import CustomerTable from '@/components/customers/CustomerTable';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Customers = () => {
  const navigate = useNavigate();
  
  const handleOnboardNewCustomer = () => {
    navigate('/onboarding');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customer Management</h1>
        <Button onClick={handleOnboardNewCustomer} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          New Customer
        </Button>
      </div>
      <CustomerTable />
    </div>
  );
};

export default Customers;
