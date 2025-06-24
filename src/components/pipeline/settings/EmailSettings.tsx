
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Zap, Shield, Globe } from "lucide-react";
import ResendSettings from './email-providers/ResendSettings';
import SendGridSettings from './email-providers/SendGridSettings';
import MailgunSettings from './email-providers/MailgunSettings';
import PostmarkSettings from './email-providers/PostmarkSettings';

const EmailSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-500" />
          Email Integration Settings
        </CardTitle>
        <CardDescription>
          Configure your email service provider for reliable email delivery to your South African customers.
        </CardDescription>
      </CardHeader>
      <CardContent>
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

        {/* Comparison Table */}
        <div className="mt-8 pt-6 border-t">
          <h3 className="font-semibold mb-4">Quick Comparison for South African Businesses</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Provider</th>
                  <th className="text-left p-2">Free Tier</th>
                  <th className="text-left p-2">Best For</th>
                  <th className="text-left p-2">SA Connectivity</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-medium">Resend</td>
                  <td className="p-2">3,000/month</td>
                  <td className="p-2">Startups, modern apps</td>
                  <td className="p-2">Good</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">SendGrid</td>
                  <td className="p-2">100/day</td>
                  <td className="p-2">Established businesses</td>
                  <td className="p-2">Excellent</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-medium">Mailgun</td>
                  <td className="p-2">5,000 (3 months)</td>
                  <td className="p-2">Developers, high volume</td>
                  <td className="p-2">Good (EU region)</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Postmark</td>
                  <td className="p-2">100 test emails</td>
                  <td className="p-2">Mission-critical emails</td>
                  <td className="p-2">Excellent</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* South African Specific Notes */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="font-medium text-yellow-900 mb-2">🇿🇦 Tips for South African Businesses</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• Use .co.za domains for better local trust and deliverability</li>
            <li>• Include physical South African address in email footers</li>
            <li>• Consider POPIA compliance for customer data handling</li>
            <li>• Test emails during SA business hours for best results</li>
            <li>• Use local phone numbers (+27) in email signatures</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailSettings;
