
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Shield, Globe, Mail } from "lucide-react";
import ResendSettings from '../email-providers/ResendSettings';
import SendGridSettings from '../email-providers/SendGridSettings';
import MailgunSettings from '../email-providers/MailgunSettings';
import PostmarkSettings from '../email-providers/PostmarkSettings';

const EmailProviderTabs = () => {
  return (
    <Tabs defaultValue="resend" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="resend" className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Resend
        </TabsTrigger>
        <TabsTrigger value="sendgrid" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          SendGrid
        </TabsTrigger>
        <TabsTrigger value="mailgun" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Mailgun
        </TabsTrigger>
        <TabsTrigger value="postmark" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Postmark
        </TabsTrigger>
      </TabsList>

      <TabsContent value="resend" className="mt-6">
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">✅ Currently Active - Resend</h3>
          <p className="text-sm text-blue-800">
            Resend is already integrated with your Supabase setup. Perfect for South African businesses starting out.
          </p>
        </div>
        <ResendSettings />
      </TabsContent>

      <TabsContent value="sendgrid" className="mt-6">
        <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-900 mb-2">🏆 Popular Choice - SendGrid</h3>
          <p className="text-sm text-green-800">
            Trusted by many South African businesses. Excellent deliverability and comprehensive features.
          </p>
        </div>
        <SendGridSettings />
      </TabsContent>

      <TabsContent value="mailgun" className="mt-6">
        <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-900 mb-2">🔧 Developer Favorite - Mailgun</h3>
          <p className="text-sm text-purple-800">
            Powerful APIs and detailed analytics. EU region available for better SA connectivity.
          </p>
        </div>
        <MailgunSettings />
      </TabsContent>

      <TabsContent value="postmark" className="mt-6">
        <div className="mb-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <h3 className="font-semibold text-orange-900 mb-2">⚡ Speed Champion - Postmark</h3>
          <p className="text-sm text-orange-800">
            Industry-leading delivery speed and reliability. Perfect for critical transactional emails.
          </p>
        </div>
        <PostmarkSettings />
      </TabsContent>
    </Tabs>
  );
};

export default EmailProviderTabs;
