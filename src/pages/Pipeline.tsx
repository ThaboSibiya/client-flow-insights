
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Ticket, Settings } from "lucide-react";
import CustomerPipeline from '@/components/pipeline/CustomerPipeline';
import TicketPipeline from '@/components/pipeline/TicketPipeline';
import PipelineSettings from '@/components/pipeline/PipelineSettings';
import PipelineErrorBoundary from '@/components/error/PipelineErrorBoundary';

type TabValue = 'customers' | 'tickets' | 'settings';

const Pipeline: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabValue>('customers');

  // Handle URL-based tab switching
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabFromUrl = searchParams.get('tab') as TabValue;
    if (tabFromUrl && ['customers', 'tickets', 'settings'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [location.search]);

  const handleTabChange = (value: string) => {
    const newTab = value as TabValue;
    setActiveTab(newTab);
    
    // Update URL without the tab parameter for clean URLs
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('tab');
    const newSearch = searchParams.toString();
    const newPath = newSearch ? `${location.pathname}?${newSearch}` : location.pathname;
    navigate(newPath, { replace: true });
  };

  return (
    <PipelineErrorBoundary>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Pipeline Management
            </h1>
            <p className="text-muted-foreground">
              Manage customer and ticket pipelines with drag-and-drop
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Customers</span>
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              <span className="hidden sm:inline">Tickets</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="mt-6">
            <PipelineErrorBoundary>
              <CustomerPipeline />
            </PipelineErrorBoundary>
          </TabsContent>

          <TabsContent value="tickets" className="mt-6">
            <PipelineErrorBoundary>
              <TicketPipeline />
            </PipelineErrorBoundary>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <PipelineSettings />
          </TabsContent>
        </Tabs>
      </div>
    </PipelineErrorBoundary>
  );
};

export default Pipeline;
