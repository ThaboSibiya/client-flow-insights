import React from 'react';
import WebhookWorkflowsManager from '@/components/pipeline/automation/WebhookWorkflowsManager';

const WebhookWorkflows = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Webhook Workflows</h1>
        <p className="text-sm text-muted-foreground">
          Manage API endpoints and webhook connections
        </p>
      </div>
      <WebhookWorkflowsManager />
    </div>
  );
};

export default WebhookWorkflows;
