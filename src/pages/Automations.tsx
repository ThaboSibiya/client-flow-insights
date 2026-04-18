import React from 'react';
import AutomationManager from '@/components/pipeline/AutomationManagerNew';
import AIAgentBanner from '@/components/pipeline/automation/AIAgentBanner';

const Automations = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-quikle-primary via-quikle-secondary to-quikle-accent bg-clip-text text-transparent">
          Automations
        </h1>
        <p className="text-muted-foreground text-sm">
          Build and manage automated workflows
        </p>
      </div>
      <AIAgentBanner />
      <AutomationManager />
    </div>
  );
};

export default Automations;

