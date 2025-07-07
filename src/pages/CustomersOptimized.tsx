
import React, { useState } from 'react';
import CustomerTableOptimized from '@/components/customers/CustomerTableOptimized';
import { Button } from '@/components/ui/button';
import { UserPlus, Phone, MapPin, Users, TrendingUp, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AiVoiceSessionDialog from '@/components/voice/AiVoiceSessionDialog';
import KnowledgeBaseManager from '@/components/settings/KnowledgeBaseManager';
import { AiAgentSettings } from '@/components/settings/AiAgentSettings';
import OnSiteStatusUpdate from '@/components/customers/OnSiteStatusUpdate';
import { useCustomerData } from '@/hooks/useCustomerData';

const CustomersOptimized = () => {
  const navigate = useNavigate();
  const { customers } = useCustomerData();
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [isOnSiteUpdateOpen, setIsOnSiteUpdateOpen] = useState(false);
  
  const handleOnboardNewCustomer = () => {
    navigate('/onboarding');
  };

  // Calculate metrics
  const totalCustomers = customers.length;
  const newCustomers = customers.filter(c => c.status === 'new').length;
  const activeTickets = customers.reduce((sum, c) => sum + (c.ticketCount || 0), 0);
  const recentCustomers = customers.filter(c => {
    const daysSinceCreated = (new Date().getTime() - c.createdAt.getTime()) / (1000 * 3600 * 24);
    return daysSinceCreated <= 7;
  }).length;
  
  return (
    <div className="space-y-8">
      {/* Header Section with Metrics */}
      <div className="bg-gradient-to-r from-quikle-primary/20 via-quikle-accent/15 to-quikle-secondary/20 p-8 rounded-xl shadow-luxury transform hover:scale-[1.01] transition-all duration-300 border border-white/20 backdrop-blur-sm quikle-card">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gradient-quikle drop-shadow-sm mb-2">Client Management</h1>
            <p className="text-quikle-slate">Comprehensive customer relationship management with advanced analytics and automation.</p>
            
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-quikle-silver/30">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-quikle-primary" />
                  <div>
                    <p className="text-sm font-medium text-quikle-slate">Total Clients</p>
                    <p className="text-2xl font-bold text-quikle-charcoal">{totalCustomers}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-quikle-silver/30">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-quikle-slate">New Clients</p>
                    <p className="text-2xl font-bold text-quikle-charcoal">{newCustomers}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-quikle-silver/30">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-quikle-accent" />
                  <div>
                    <p className="text-sm font-medium text-quikle-slate">Active Tickets</p>
                    <p className="text-2xl font-bold text-quikle-charcoal">{activeTickets}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-quikle-silver/30">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-quikle-slate">This Week</p>
                    <p className="text-2xl font-bold text-quikle-charcoal">{recentCustomers}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={() => setIsOnSiteUpdateOpen(true)}
              variant="outline"
              className="flex items-center gap-2 quikle-button-secondary shadow-md"
            >
              <MapPin className="h-4 w-4" />
              Job Complete
            </Button>
            <Button 
              onClick={() => setIsSessionOpen(true)}
              variant="outline"
              className="flex items-center gap-2 quikle-button-secondary shadow-md"
            >
              <Phone className="h-4 w-4" />
              AI Agent
            </Button>
            <Button 
              onClick={handleOnboardNewCustomer} 
              className="flex items-center gap-2 quikle-button-primary shadow-md"
            >
              <UserPlus className="h-4 w-4" />
              New Client
            </Button>
          </div>
        </div>
      </div>

      {/* Customer Table Section */}
      <div className="quikle-card p-6 rounded-xl">
        <CustomerTableOptimized />
      </div>

      {/* AI Configuration Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="quikle-card border-quikle-silver/30">
          <CardHeader>
            <CardTitle className="text-quikle-charcoal">AI Agent Configuration</CardTitle>
            <CardDescription>Configure your AI assistant for customer interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <AiAgentSettings />
          </CardContent>
        </Card>
        
        <Card className="quikle-card border-quikle-silver/30">
          <CardHeader>
            <CardTitle className="text-quikle-charcoal">Knowledge Base</CardTitle>
            <CardDescription>Manage your AI agent's knowledge repository</CardDescription>
          </CardHeader>
          <CardContent>
            <KnowledgeBaseManager />
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <AiVoiceSessionDialog isOpen={isSessionOpen} onOpenChange={setIsSessionOpen} />
      <OnSiteStatusUpdate isOpen={isOnSiteUpdateOpen} onClose={() => setIsOnSiteUpdateOpen(false)} />
    </div>
  );
};

export default CustomersOptimized;
