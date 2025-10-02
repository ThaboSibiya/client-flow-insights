
import React from 'react';
import AutomationManager from '@/components/pipeline/AutomationManager';

const Automations = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-quikle-primary via-quikle-secondary to-quikle-accent bg-clip-text text-transparent drop-shadow-lg">
          Automations
        </h1>
        <p className="text-quikle-charcoal/70 font-medium">
          Create and manage automation workflows for customers and tickets
        </p>
      </div>
      <AutomationManager />
    </div>
  );
};

export default Automations;
