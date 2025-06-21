
import React, { useState } from 'react';
import CustomerTable from '@/components/customers/CustomerTable';
import { Button } from '@/components/ui/button';
import { UserPlus, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AiVoiceSessionDialog from '@/components/voice/AiVoiceSessionDialog';
import KnowledgeBaseManager from '@/components/settings/KnowledgeBaseManager';
import { AiAgentSettings } from '@/components/settings/AiAgentSettings';
import OnSiteStatusUpdate from '@/components/customers/OnSiteStatusUpdate';

const Customers = () => {
  const navigate = useNavigate();
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [isOnSiteUpdateOpen, setIsOnSiteUpdateOpen] = useState(false);
  
  const handleOnboardNewCustomer = () => {
    navigate('/onboarding');
  };
  
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-quikle-primary/20 via-quikle-accent/15 to-quikle-secondary/20 p-8 rounded-xl shadow-luxury transform hover:scale-[1.01] transition-all duration-300 border border-white/20 backdrop-blur-sm quikle-card">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient-quikle drop-shadow-sm">Client Management</h1>
            <p className="text-quikle-slate mt-1">View, manage, and communicate with your clients. Use advanced filters, bulk actions, and real-time metrics.</p>
          </div>
          <div className="flex gap-2">
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
        <CustomerTable />
      </div>

      {/* AI Configuration Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="quikle-card p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-quikle-charcoal mb-4">AI Agent Configuration</h2>
          <AiAgentSettings />
        </div>
        
        <div className="quikle-card p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-quikle-charcoal mb-4">Knowledge Base</h2>
          <KnowledgeBaseManager />
        </div>
      </div>

      {/* Voice Session Dialog */}
      <AiVoiceSessionDialog isOpen={isSessionOpen} onOpenChange={setIsSessionOpen} />
      
      {/* On-Site Status Update Dialog */}
      <OnSiteStatusUpdate isOpen={isOnSiteUpdateOpen} onClose={() => setIsOnSiteUpdateOpen(false)} />
    </div>
  );
};

export default Customers;
