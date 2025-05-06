
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
      <div className="bg-gradient-to-r from-broker-primary/10 to-broker-accent/10 p-6 rounded-lg mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Customer Management</h1>
            <p className="text-muted-foreground mt-1">Manage and track your customer relationships</p>
          </div>
          <Button 
            onClick={handleOnboardNewCustomer} 
            className="flex items-center gap-2 bg-gradient-to-r from-broker-primary to-broker-accent text-white hover:shadow-lg transition-all"
          >
            <UserPlus className="h-4 w-4" />
            New Customer
          </Button>
        </div>
      </div>
      <CustomerTable />
    </div>
  );
};

export default Customers;
