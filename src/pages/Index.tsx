
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-broker-primary via-broker-secondary to-broker-accent bg-clip-text text-transparent">Welcome to Broker CRM</h1>
        <p className="text-xl mt-4 text-gray-600 max-w-2xl">Your all-in-one platform for managing customer relationships, tracking policies, and growing your insurance business.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow border-t-4 border-broker-primary bg-gradient-to-br from-white to-gray-50">
          <CardContent className="pt-6">
            <h3 className="text-xl font-medium mb-3 text-gray-800">Customer Management</h3>
            <p className="text-gray-600 mb-5">Track all your customer interactions and policy information in one place.</p>
            <Button 
              onClick={() => navigate('/customers')} 
              variant="outline" 
              className="w-full border-broker-primary text-broker-primary hover:bg-broker-primary hover:text-white transition-all"
            >
              View Customers
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-shadow border-t-4 border-broker-secondary bg-gradient-to-br from-white to-gray-50">
          <CardContent className="pt-6">
            <h3 className="text-xl font-medium mb-3 text-gray-800">Dashboard</h3>
            <p className="text-gray-600 mb-5">Get a comprehensive overview of your business at a glance.</p>
            <Button 
              onClick={() => navigate('/dashboard')} 
              variant="outline" 
              className="w-full border-broker-secondary text-broker-secondary hover:bg-broker-secondary hover:text-white transition-all"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-shadow border-t-4 border-broker-accent bg-gradient-to-br from-white to-gray-50">
          <CardContent className="pt-6">
            <h3 className="text-xl font-medium mb-3 text-gray-800">Analytics</h3>
            <p className="text-gray-600 mb-5">Analyze your sales data and customer conversion metrics.</p>
            <Button 
              onClick={() => navigate('/analytics')} 
              variant="outline" 
              className="w-full border-broker-accent text-broker-accent hover:bg-broker-accent hover:text-white transition-all"
            >
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
