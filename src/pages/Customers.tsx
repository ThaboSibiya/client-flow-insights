import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import CustomerTable from '@/components/customers/CustomerTable';
import { MobileCustomersView } from '@/components/customers/mobile';
import { Button } from '@/components/ui/button';
import { UserPlus, MapPin, Settings2, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OnSiteStatusUpdate from '@/components/customers/OnSiteStatusUpdate';
import CustomerErrorBoundary from '@/components/error/CustomerErrorBoundary';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Customers: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isOnSiteUpdateOpen, setIsOnSiteUpdateOpen] = useState<boolean>(false);
  const [isOnSiteUpdateOpen, setIsOnSiteUpdateOpen] = useState<boolean>(false);
  const [isAiConfigOpen, setIsAiConfigOpen] = useState<boolean>(false);
  
  const handleOnboardNewCustomer = (): void => {
    navigate('/onboarding');
  };
  
  // Lazy load AI config components only when needed
  const KnowledgeBaseManager = React.lazy(() => import('@/components/settings/KnowledgeBaseManager'));
  const AiAgentSettings = React.lazy(() => import('@/components/settings/AiAgentSettings').then(m => ({ default: m.AiAgentSettings })));

  // Mobile Layout
  if (isMobile) {
    return (
      <CustomerErrorBoundary>
        <MobileCustomersView />
        <AiVoiceSessionDialog isOpen={isSessionOpen} onOpenChange={setIsSessionOpen} />
        <OnSiteStatusUpdate isOpen={isOnSiteUpdateOpen} onClose={() => setIsOnSiteUpdateOpen(false)} />
      </CustomerErrorBoundary>
    );
  }
  
  // Desktop Layout
  return (
    <CustomerErrorBoundary>
      <div className="space-y-6">
        {/* Clean Header Section */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-quikle-primary via-quikle-secondary to-quikle-accent bg-clip-text text-transparent">
              Clients
            </h1>
            <p className="text-sm text-quikle-slate mt-0.5">
              Manage your client relationships
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Secondary actions in dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-quikle-silver/50 text-quikle-slate hover:bg-quikle-crystal"
                >
                  <Settings2 className="h-4 w-4 mr-1.5" />
                  More
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setIsOnSiteUpdateOpen(true)}>
                  <MapPin className="h-4 w-4 mr-2" />
                  Job Complete
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsSessionOpen(true)}>
                  <Phone className="h-4 w-4 mr-2" />
                  AI Voice Agent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsAiConfigOpen(!isAiConfigOpen)}>
                  <Settings2 className="h-4 w-4 mr-2" />
                  AI Configuration
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Primary CTA */}
            <Button 
              onClick={handleOnboardNewCustomer} 
              size="sm"
              className="quikle-button-primary shadow-md"
            >
              <UserPlus className="h-4 w-4 mr-1.5" />
              New Client
            </Button>
          </div>
        </div>

        {/* Customer Table Section - Main Content */}
        <div className="quikle-card rounded-xl overflow-hidden">
          <CustomerErrorBoundary>
            <CustomerTable />
          </CustomerErrorBoundary>
        </div>

        {/* Collapsible AI Configuration Section */}
        <Collapsible open={isAiConfigOpen} onOpenChange={setIsAiConfigOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-between text-quikle-slate hover:bg-quikle-crystal/50 border border-dashed border-quikle-silver/30"
            >
              <span className="flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                AI Configuration
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isAiConfigOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <React.Suspense fallback={
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-64 bg-quikle-crystal/50 rounded-xl animate-pulse" />
                <div className="h-64 bg-quikle-crystal/50 rounded-xl animate-pulse" />
              </div>
            }>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="quikle-card p-6 rounded-xl">
                  <h2 className="text-lg font-semibold text-quikle-charcoal mb-4">AI Agent Configuration</h2>
                  <AiAgentSettings />
                </div>
                
                <div className="quikle-card p-6 rounded-xl">
                  <h2 className="text-lg font-semibold text-quikle-charcoal mb-4">Knowledge Base</h2>
                  <KnowledgeBaseManager />
                </div>
              </div>
            </React.Suspense>
          </CollapsibleContent>
        </Collapsible>

        {/* Voice Session Dialog */}
        <AiVoiceSessionDialog isOpen={isSessionOpen} onOpenChange={setIsSessionOpen} />
        
        {/* On-Site Status Update Dialog */}
        <OnSiteStatusUpdate isOpen={isOnSiteUpdateOpen} onClose={() => setIsOnSiteUpdateOpen(false)} />
      </div>
    </CustomerErrorBoundary>
  );
};

export default Customers;
