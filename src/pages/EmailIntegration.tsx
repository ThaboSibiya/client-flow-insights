import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Mail } from 'lucide-react';

const EmailIntegration = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Email Integration</h1>
        <p className="text-sm text-muted-foreground">
          Configure email providers and sync settings
        </p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Mail className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium mb-2">Email Integration</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Connect your email provider to sync conversations and automate follow-ups.
            Configure this in Settings → Integrations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailIntegration;
