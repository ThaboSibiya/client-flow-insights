
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail } from "lucide-react";

const EmailSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-500" />
          Email Configuration
        </CardTitle>
        <CardDescription>
          Connect your email provider to send emails from your own address.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Email integration settings (e.g., with Resend, SendGrid) will be available here soon.
        </p>
      </CardContent>
    </Card>
  );
};

export default EmailSettings;
