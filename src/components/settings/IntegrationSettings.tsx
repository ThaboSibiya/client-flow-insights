
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TwilioSettings } from '@/components/pipeline/settings/TwilioSettings';
import { TelnyxSettings } from '@/components/pipeline/settings/TelnyxSettings';
import { EmailSettings } from '@/components/pipeline/settings/EmailSettings';

const IntegrationSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-quikle-charcoal mb-2">Communication Services</h3>
        <p className="text-sm text-quikle-slate mb-4">
          Configure third-party services for SMS, email, and other communications.
        </p>
      </div>
      
      <TwilioSettings />
      <TelnyxSettings />
      <EmailSettings />
    </div>
  );
};

export default IntegrationSettings;
