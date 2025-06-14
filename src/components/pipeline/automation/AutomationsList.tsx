
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AutomationCard from './AutomationCard';
import { Clock, Zap, Settings, Webhook } from "lucide-react";

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

interface AutomationsListProps {
  automations: Automation[];
  onToggleAutomation: (id: string) => void;
  onCreateNew: () => void;
}

const AutomationsList = ({ automations, onToggleAutomation, onCreateNew }: AutomationsListProps) => {
  const getTriggerIcon = (triggerType?: string) => {
    switch (triggerType) {
      case 'time': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'webhook': return <Webhook className="h-4 w-4 text-green-500" />;
      case 'advanced': return <Settings className="h-4 w-4 text-purple-500" />;
      default: return <Zap className="h-4 w-4 text-quikle-primary" />;
    }
  };

  if (automations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-lg font-semibold mb-2">No Automations Yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first automation to streamline your workflow
          </p>
          <Button onClick={onCreateNew}>
            Create Your First Automation
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {automations.map((automation) => (
        <AutomationCard
          key={automation.id}
          automation={automation}
          onToggle={onToggleAutomation}
          getTriggerIcon={getTriggerIcon}
        />
      ))}
    </div>
  );
};

export default AutomationsList;
