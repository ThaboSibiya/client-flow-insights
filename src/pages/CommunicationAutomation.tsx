
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, MessageSquare, Send, Phone, Settings } from 'lucide-react';
import CommunicationSettings from '@/components/customers/enhanced/CommunicationSettings';
import TicketRoutingSettings from '@/components/tickets/TicketRoutingSettings';

const CommunicationAutomation = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500/20 via-blue-500/15 to-purple-500/20 p-6 rounded-xl border border-white/20 backdrop-blur-sm">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
          Communication & Support Automation
        </h1>
        <p className="text-muted-foreground mt-1">
          Automate customer communications and intelligent ticket routing across all channels
        </p>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            SMS
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="calls" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Calls
          </TabsTrigger>
          <TabsTrigger value="routing" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Ticket Routing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <CommunicationSettings />
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <div className="text-center py-12">
            <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Email Automation</h3>
            <p className="text-muted-foreground">
              Configure welcome sequences, status updates, and automated email campaigns.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="sms" className="space-y-6">
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">SMS Notifications</h3>
            <p className="text-muted-foreground">
              Set up urgent notifications and status change alerts via SMS.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-6">
          <div className="text-center py-12">
            <Send className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">WhatsApp Integration</h3>
            <p className="text-muted-foreground">
              Send job completion confirmations and updates via WhatsApp.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="calls" className="space-y-6">
          <div className="text-center py-12">
            <Phone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Call Scheduling</h3>
            <p className="text-muted-foreground">
              Automatically schedule follow-up calls based on customer preferences and status.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="routing" className="space-y-6">
          <TicketRoutingSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunicationAutomation;
