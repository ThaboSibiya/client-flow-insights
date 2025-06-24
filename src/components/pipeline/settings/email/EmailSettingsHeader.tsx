
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail } from "lucide-react";

const EmailSettingsHeader = () => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Mail className="h-5 w-5 text-blue-500" />
        Email Integration Settings
      </CardTitle>
      <CardDescription>
        Configure your email service provider for reliable email delivery to your South African customers.
      </CardDescription>
    </CardHeader>
  );
};

export default EmailSettingsHeader;
