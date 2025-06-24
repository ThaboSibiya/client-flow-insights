
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import EmailSettingsHeader from './email/EmailSettingsHeader';
import EmailProviderTabs from './email/EmailProviderTabs';
import EmailProvidersComparison from './email/EmailProvidersComparison';
import SouthAfricanEmailTips from './email/SouthAfricanEmailTips';

const EmailSettings = () => {
  return (
    <Card>
      <EmailSettingsHeader />
      <CardContent>
        <EmailProviderTabs />
        <EmailProvidersComparison />
        <SouthAfricanEmailTips />
      </CardContent>
    </Card>
  );
};

export default EmailSettings;
