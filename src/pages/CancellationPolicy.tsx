import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  Clock, 
  Database, 
  RefreshCw, 
  ShieldAlert, 
  FileText, 
  Users, 
  CreditCard,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const POLICY_SECTIONS = [
  {
    icon: CreditCard,
    title: '1. Cancellation Process',
    items: [
      'You may cancel your Quikle CRM subscription at any time from Settings → Billing.',
      'Cancellation takes effect at the end of your current billing period — you will retain access to paid features until then.',
      'No partial or pro-rated refunds are issued for unused time within a billing cycle.',
      'All cancellations are final for the current billing period once confirmed.',
    ],
  },
  {
    icon: Database,
    title: '2. Data Retention & Deletion',
    items: [
      'After cancellation, your account data (customers, invoices, transactions, conversations, and files) is retained for 30 calendar days.',
      'During the 30-day grace period, you may export your data via the available export tools.',
      'After the 30-day retention window, all data is permanently and irreversibly deleted from our systems.',
      'Quikle is not responsible for data loss after the retention period has expired.',
    ],
  },
  {
    icon: Users,
    title: '3. Downgrade & Feature Access',
    items: [
      'Upon cancellation, your account reverts to a read-only free tier with limited access.',
      'All automations, webhooks, scheduled workflows, and integrations are immediately paused.',
      'Employee sub-accounts linked to your subscription are deactivated upon cancellation.',
      'API access tied to your subscription plan is revoked at the end of the billing period.',
    ],
  },
  {
    icon: RefreshCw,
    title: '4. Reactivation',
    items: [
      'You may reactivate your subscription within the 30-day grace period to restore full access and data.',
      'After the 30-day window, reactivation starts a new subscription with no historical data.',
      'Reactivation pricing is based on the current published rates at the time of re-subscription.',
    ],
  },
  {
    icon: ShieldAlert,
    title: '5. Limitation of Liability',
    content: 'Quikle (Pty) Ltd expressly disclaims liability for the following:',
    items: [
      'Loss of data after the 30-day retention window has expired.',
      'Business disruption, revenue loss, or operational impact caused by the cancellation of automations, integrations, or workflows.',
      'Interruptions or failures of third-party services including but not limited to Paystack, Twilio, email providers, and cloud infrastructure.',
      'Financial losses resulting from paused automated follow-ups, reminders, or scheduled communications.',
      'Data exported by the user and stored, processed, or shared outside of Quikle systems.',
      'Unauthorized cancellations performed by team members or employees who have been granted billing access.',
      'Any indirect, incidental, special, consequential, or punitive damages arising from or related to the use or cancellation of the service.',
    ],
  },
  {
    icon: FileText,
    title: '6. Governing Terms',
    items: [
      'This Cancellation Policy forms part of the Quikle CRM Terms of Service.',
      'Quikle reserves the right to update this policy at any time. Users will be notified of material changes via email or in-app notification.',
      'Continued use of the service after changes constitutes acceptance of the revised policy.',
      'This policy is governed by the laws of the Republic of South Africa.',
      'For the full agreement, please review the Terms of Service.',
    ],
  },
];

const CancellationPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-foreground">Cancellation Policy</h1>
        <p className="text-muted-foreground mt-1">
          Quikle CRM — Subscription Cancellation & Data Retention Policy
        </p>
        <Badge variant="outline" className="mt-2 text-xs">
          Last updated: March 2026
        </Badge>
      </div>

      <Card className="border-amber-300/50 bg-amber-50/30 dark:bg-amber-950/20">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-300">Important Notice</p>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Please read this policy carefully before cancelling your subscription. Cancellation is 
              irreversible after the 30-day grace period and all associated data will be permanently deleted.
            </p>
          </div>
        </CardContent>
      </Card>

      {POLICY_SECTIONS.map((section, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <section.icon className="h-5 w-5 text-primary" />
              {section.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {section.content && (
              <p className="text-sm text-muted-foreground mb-3 font-medium">{section.content}</p>
            )}
            <ul className="space-y-2.5">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}

      <Separator />

      <Card>
        <CardContent className="p-4 flex items-start gap-3">
          <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-sm text-foreground">Questions about cancellation?</p>
            <p className="text-xs text-muted-foreground">
              Contact our support team at{' '}
              <a href="mailto:support@quikle.com" className="text-primary hover:underline">
                support@quikle.com
              </a>{' '}
              or reach out through the in-app Help button for assistance.
            </p>
            <Link to="/terms-of-service" className="text-xs text-primary hover:underline mt-1 inline-block">
              View full Terms of Service →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CancellationPolicy;
