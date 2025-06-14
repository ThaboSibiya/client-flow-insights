
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Settings, Clock } from "lucide-react";

interface Automation {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  isActive: boolean;
  type: 'customer' | 'ticket';
  triggerType?: 'simple' | 'advanced' | 'time' | 'webhook';
  lastTriggered?: string;
  triggerCount?: number;
}

interface AutomationAnalyticsProps {
  automations: Automation[];
}

const AutomationAnalytics = ({ automations }: AutomationAnalyticsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Automations</p>
              <p className="text-2xl font-bold">{automations.length}</p>
            </div>
            <Zap className="h-8 w-8 text-quikle-primary" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Automations</p>
              <p className="text-2xl font-bold">{automations.filter(a => a.isActive).length}</p>
            </div>
            <Settings className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Triggers</p>
              <p className="text-2xl font-bold">
                {automations.reduce((sum, a) => sum + (a.triggerCount || 0), 0)}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationAnalytics;
