
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
      <div className="bg-gradient-to-r from-broker-primary/20 via-broker-secondary/15 to-broker-accent/20 p-8 rounded-xl mb-6 shadow-lg transform hover:scale-[1.01] transition-all duration-300 border border-white/20 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-broker-primary via-broker-secondary to-broker-accent bg-clip-text text-transparent drop-shadow-sm">Customer Management</h1>
            <p className="text-muted-foreground mt-1">Manage and track your customer relationships</p>
          </div>
          <Button 
            onClick={handleOnboardNewCustomer} 
            className="flex items-center gap-2 bg-gradient-to-r from-broker-primary to-broker-accent text-white hover:shadow-lg transition-all transform hover:translate-y-[-2px] shadow-md"
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
