
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Clock, Mail, ArrowRight, Webhook } from "lucide-react";

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

interface AutomationCardProps {
  automation: Automation;
  onToggle: (id: string) => void;
  getTriggerIcon: (triggerType?: string) => React.ReactNode;
}

const AutomationCard = ({ automation, onToggle, getTriggerIcon }: AutomationCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {getTriggerIcon(automation.triggerType)}
              {automation.name}
              <Badge variant={automation.type === 'customer' ? 'default' : 'secondary'}>
                {automation.type}
              </Badge>
              {automation.triggerType && automation.triggerType !== 'simple' && (
                <Badge variant="outline" className="text-xs">
                  {automation.triggerType}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="flex items-center gap-4">
              <span>{automation.trigger}</span>
              {automation.triggerCount !== undefined && (
                <span className="text-xs">
                  • {automation.triggerCount} triggers
                  {automation.lastTriggered && (
                    <> • Last: {new Date(automation.lastTriggered).toLocaleDateString()}</>
                  )}
                </span>
              )}
            </CardDescription>
          </div>
          <Switch
            checked={automation.isActive}
            onCheckedChange={() => onToggle(automation.id)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Trigger: {automation.trigger}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Actions:</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6">
            {automation.actions.map((action, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                {action.includes('email') && <Mail className="h-4 w-4 text-blue-500" />}
                {action.includes('SMS') && <span className="text-green-500">📱</span>}
                {action.includes('task') && <span className="text-quikle-slate">📋</span>}
                {action.includes('Assign') && <span className="text-purple-500">👤</span>}
                {action.includes('webhook') && <Webhook className="h-4 w-4 text-green-500" />}
                <span>{action}</span>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm">Edit</Button>
            <Button variant="outline" size="sm">Test</Button>
            <Button variant="outline" size="sm" className="text-red-600">Delete</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AutomationCard;
