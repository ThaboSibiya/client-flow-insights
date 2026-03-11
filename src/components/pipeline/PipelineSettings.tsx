import React from 'react';
import StaleLeadSettings from './settings/StaleLeadSettings';
import LeadRoutingSettings from './settings/LeadRoutingSettings';
import WinLossSettings from './settings/WinLossSettings';
import PipelineDisplaySettings from './settings/PipelineDisplaySettings';
import StageAutomationSettings from './settings/StageAutomationSettings';

const PipelineSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pipeline Settings</h2>
        <p className="text-muted-foreground">
          Configure pipeline behavior, lead management, and display preferences.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <StaleLeadSettings />
        <LeadRoutingSettings />
        <StageAutomationSettings />
        <WinLossSettings />
      </div>

      <PipelineDisplaySettings />
    </div>
  );
};

export default PipelineSettings;
