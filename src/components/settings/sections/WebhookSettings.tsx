
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Webhook, Plus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import WebhookWorkflowsManager from '@/components/pipeline/automation/WebhookWorkflowsManager';

const WebhookSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-quikle-primary" />
            Webhook Integrations
          </CardTitle>
          <CardDescription>
            Connect external systems and services to your Quikle workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WebhookWorkflowsManager />
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-quikle-charcoal">Full Integration Management</h4>
              <p className="text-sm text-quikle-slate/70 mt-1">
                View all integrations and connection settings
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/integrations" className="flex items-center gap-2">
                View All Integrations
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebhookSettings;
