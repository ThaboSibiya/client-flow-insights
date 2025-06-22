
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Smartphone, Clock, Users, Settings } from "lucide-react";

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

interface MobileAutomationViewProps {
  automations: Automation[];
  onToggleAutomation: (id: string) => void;
}

const MobileAutomationView = ({ automations, onToggleAutomation }: MobileAutomationViewProps) => {
  return (
    <div className="space-y-4 px-4">
      <div className="flex items-center gap-2 mb-4">
        <Smartphone className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Mobile Automations</h2>
      </div>
      
      {automations.map((automation) => (
        <Card key={automation.id} className="border">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-sm font-medium line-clamp-2">
                  {automation.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {automation.type}
                  </Badge>
                  {automation.triggerType && (
                    <Badge variant="secondary" className="text-xs">
                      {automation.triggerType}
                    </Badge>
                  )}
                </div>
              </div>
              <Switch
                checked={automation.isActive}
                onCheckedChange={() => onToggleAutomation(automation.id)}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                <strong>Trigger:</strong> {automation.trigger}
              </div>
              <div className="text-xs text-muted-foreground">
                <strong>Actions:</strong> {automation.actions.join(', ')}
              </div>
              {automation.lastTriggered && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Last: {new Date(automation.lastTriggered).toLocaleDateString()}
                </div>
              )}
              {automation.triggerCount && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  Triggered: {automation.triggerCount} times
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MobileAutomationView;
