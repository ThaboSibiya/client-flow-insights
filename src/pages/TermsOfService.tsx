import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Scale,
  ShieldCheck,
  UserCheck,
  CreditCard,
  Ban,
  Database,
  Lock,
  Clock,
  XCircle,
  Puzzle,
  Award,
  Server,
  AlertTriangle,
  Shield,
  Landmark,
  Gavel,
  BookOpen,
  FileText,
  Pencil,
  ScrollText,
  Mail,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';

const TOS_SECTIONS = [
  {
    icon: BookOpen,
    title: '1. Definitions & Interpretation',
    items: [
      '"Quikle," "we," "us," or "our" refers to Quikle (Pty) Ltd, a company registered in the Republic of South Africa.',
      '"User," "you," or "your" refers to any individual or entity that registers for, accesses, or uses the Service.',
      '"Service" refers to the Quikle CRM platform, including all features, APIs, integrations, mobile applications, and related tools.',
      '"Subscription" refers to a paid or free-tier access plan that grants you use of the Service.',
      '"Data" or "User Data" refers to all customer records, files, communications, metadata, and other information stored within Quikle by you or on your behalf.',
    ],
  },
  {
    icon: FileText,
    title: '2. Acceptance of Terms',
    items: [
      'By registering for, accessing, or using Quikle, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.',
      'If you are using Quikle on behalf of an organisation, you represent and warrant that you have the authority to bind that entity to these Terms.',
      'Continued use of the Service after any updates to these Terms constitutes your acceptance of the revised Terms.',
    ],
  },
  {
    icon: UserCheck,
    title: '3. Account Registration & Security',
    items: [
      'You must provide accurate, complete, and current registration information when creating an account.',
      'You are solely responsible for maintaining the confidentiality of your login credentials and for all activities conducted under your account.',
      'You must notify Quikle immediately of any unauthorised access to or use of your account.',
      'Sub-accounts created for employees are your responsibility — their actions within the platform are attributed to your account.',
      'Quikle reserves the right to suspend or terminate accounts suspected of unauthorised access, fraud, or abuse.',
    ],
  },
  {
    icon: CreditCard,
    title: '4. Subscription Plans & Billing',
    items: [
      'Subscription plans and pricing are published on the Quikle website and within the application. Prices may change with a minimum of 30 days\' prior notice.',
      'Billing is recurring (monthly or annually) and charged in advance at the beginning of each billing cycle.',
      'Failed payments may result in service suspension after a 7-day grace period.',
      'No refunds are issued for partial or unused billing periods, as detailed in the Cancellation Policy.',
      'All applicable taxes, including Value-Added Tax (VAT) as required under South African law, are the User\'s responsibility.',
    ],
  },
  {
    icon: Ban,
    title: '5. Permitted Use & Restrictions',
    items: [
      'You may use Quikle solely for lawful business purposes in accordance with these Terms.',
      'You may not reverse-engineer, decompile, disassemble, scrape, redistribute, sublicense, or resell any part of the Service.',
      'You may not use the platform to store, transmit, or process any content that is illegal, harmful, defamatory, obscene, or infringes on the intellectual property rights of others.',
      'You may not attempt to bypass, circumvent, or interfere with any security measures, access controls, or rate limits implemented by Quikle.',
      'Automated access to the Service (bots, scripts, crawlers) is only permitted through official Quikle APIs with valid authentication credentials.',
    ],
  },
  {
    icon: Database,
    title: '6. Data Ownership & Privacy',
    items: [
      'Your Data is yours. Quikle does not claim any ownership rights over User Data stored on the platform.',
      'Quikle processes personal information as a data operator under the Protection of Personal Information Act (POPIA), Act 4 of 2013.',
      'You, as the User, are the responsible party under POPIA for all personal information you collect, store, and process via Quikle.',
      'Quikle will not sell, share, or monetise your data to or with third parties for their independent use.',
      'Full details of data processing practices are set out in the separate Quikle Privacy Policy.',
      'You are responsible for obtaining lawful consent from your customers and contacts before storing their personal information in Quikle.',
    ],
  },
  {
    icon: Lock,
    title: '7. Data Security & Storage',
    items: [
      'All data transmitted to and from the Service is encrypted in transit using TLS (Transport Layer Security).',
      'Data at rest is encrypted using industry-standard AES-256 encryption.',
      'Quikle employs commercially reasonable security measures but cannot guarantee absolute security against all threats.',
      'Infrastructure is hosted on reputable cloud service providers that maintain SOC 2 Type II compliance.',
      'In the event of a data breach, Quikle will notify affected Users within 72 hours as required by POPIA Section 22.',
    ],
  },
  {
    icon: Clock,
    title: '8. Data Retention & Deletion',
    items: [
      'Active accounts: User Data is retained for the duration of the active subscription.',
      'Cancelled accounts: User Data is retained for 30 calendar days following cancellation, after which it is permanently and irreversibly deleted.',
      'You may export your data at any time using the built-in export tools available within the platform.',
      'Quikle may retain anonymised, aggregated data for internal analytics and service improvement purposes.',
      'Full data retention and deletion procedures are detailed in the Cancellation Policy.',
    ],
  },
  {
    icon: XCircle,
    title: '9. Cancellation & Termination',
    content: 'The full Cancellation Policy is incorporated by reference into these Terms.',
    items: [
      'You may cancel your subscription at any time through Settings → Billing. Access continues until the end of the current billing period.',
      'Quikle may terminate your account for material breach of these Terms with 14 days\' written notice, except in cases of fraud or abuse where immediate suspension is warranted.',
      'Quikle may suspend accounts immediately without notice where required for fraud prevention, legal compliance, or protection of other users.',
      'Upon termination, the data retention and deletion provisions of the Cancellation Policy apply.',
    ],
  },
  {
    icon: Puzzle,
    title: '10. Third-Party Integrations',
    items: [
      'Quikle integrates with third-party services including, but not limited to, Paystack, Twilio, email service providers, and cloud infrastructure services.',
      'Third-party services are governed by their own respective terms of service and privacy policies. Quikle is not liable for their availability, performance, data handling, or security practices.',
      'By enabling a third-party integration, you authorise Quikle to transmit relevant data to and from that service on your behalf.',
      'Disabling or disconnecting an integration may result in loss of related functionality and data synced to or from that service.',
    ],
  },
  {
    icon: Award,
    title: '11. Intellectual Property',
    items: [
      'Quikle retains all intellectual property rights in and to the platform, including its source code, design, branding, documentation, and all derivative works.',
      'You retain full ownership of your business data and content stored within Quikle.',
      'Any feedback, suggestions, feature requests, or ideas submitted to Quikle may be used by us without any obligation, attribution, or compensation.',
      'The Quikle name, logo, and trademarks may not be used without prior written consent.',
    ],
  },
  {
    icon: Server,
    title: '12. Service Availability & SLA',
    items: [
      'Quikle targets 99.9% uptime but does not guarantee uninterrupted, error-free operation of the Service.',
      'Scheduled maintenance windows will be communicated at least 48 hours in advance where reasonably possible.',
      'Quikle is not liable for downtime or service interruptions caused by force majeure events, third-party infrastructure failures, internet outages, or issues on the User\'s end.',
      'Service credits or remedies for extended outages, if any, will be determined at Quikle\'s sole discretion.',
    ],
  },
  {
    icon: AlertTriangle,
    title: '13. Limitation of Liability',
    items: [
      'To the maximum extent permitted by South African law, Quikle\'s total aggregate liability for any claims arising from or related to the Service is limited to the fees paid by you in the 12 months immediately preceding the claim.',
      'Quikle is expressly not liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of revenue, profits, data, business opportunities, or goodwill.',
      'Quikle is not liable for damages arising from actions, errors, or omissions of third-party integrations.',
      'Quikle is not liable for unauthorised access resulting from User negligence in safeguarding credentials.',
    ],
  },
  {
    icon: Shield,
    title: '14. Indemnification',
    items: [
      'You agree to indemnify, defend, and hold harmless Quikle (Pty) Ltd, its directors, officers, employees, and agents from and against any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:',
      '(a) Your use or misuse of the Service.',
      '(b) Your violation of these Terms of Service.',
      '(c) Your violation of any applicable law or regulation, including POPIA.',
      '(d) Your violation of any third-party rights, including intellectual property or privacy rights.',
      '(e) Any personal information you collect, store, or process via the platform.',
    ],
  },
  {
    icon: ShieldCheck,
    title: '15. POPIA Compliance',
    items: [
      'Quikle is committed to compliance with the Protection of Personal Information Act (POPIA), Act 4 of 2013.',
      'Quikle acts as a data operator processing personal information on behalf of Users (responsible parties).',
      'Users may request access to, correction of, or deletion of their personal information by contacting privacy@quikle.com.',
      'Complaints regarding the processing of personal information may be directed to the Information Regulator of South Africa.',
      'Quikle has appointed a designated Information Officer for all POPIA-related queries and compliance matters.',
    ],
  },
  {
    icon: ScrollText,
    title: '16. Electronic Communications & Transactions (ECT Act)',
    items: [
      'These Terms of Service constitute a valid and enforceable electronic agreement under the Electronic Communications and Transactions Act (ECT Act), No. 25 of 2002.',
      'Electronic records and communications exchanged between you and Quikle are admissible as evidence in legal proceedings.',
      'Quikle complies with the cooling-off provisions of the ECT Act where applicable to consumer transactions.',
    ],
  },
  {
    icon: Scale,
    title: '17. Consumer Protection Act (CPA)',
    items: [
      'Where applicable, your rights under the Consumer Protection Act (CPA), No. 68 of 2008, are preserved and respected.',
      'Nothing in these Terms is intended to limit or exclude any rights that cannot be lawfully excluded under South African consumer protection legislation.',
      'In the event of a conflict between these Terms and the CPA, the provisions of the CPA shall prevail to the extent required by law.',
    ],
  },
  {
    icon: Gavel,
    title: '18. Dispute Resolution',
    items: [
      'Any dispute arising from or in connection with these Terms shall first be addressed through informal negotiation between the parties for a period of 30 days.',
      'If the dispute is not resolved through negotiation, it shall be submitted to mediation under the rules of the Arbitration Foundation of Southern Africa (AFSA).',
      'If mediation fails to resolve the dispute, it shall be finally resolved by binding arbitration in Johannesburg, South Africa, in accordance with AFSA rules.',
      'Notwithstanding the above, either party may seek urgent interim or injunctive relief from the High Court of South Africa where necessary to protect its rights.',
    ],
  },
  {
    icon: Pencil,
    title: '19. Modifications to Terms',
    items: [
      'Quikle reserves the right to update, modify, or replace these Terms of Service at any time.',
      'Material changes will be communicated to Users via email and/or in-app notification at least 30 days prior to the effective date.',
      'Continued use of the Service after the effective date of any changes constitutes your acceptance of the revised Terms.',
      'If you do not agree with the updated Terms, you must discontinue use of the Service before the effective date.',
    ],
  },
  {
    icon: Landmark,
    title: '20. General Provisions',
    items: [
      'Severability: If any provision of these Terms is found to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect.',
      'Entire Agreement: These Terms, together with the Privacy Policy and Cancellation Policy, constitute the entire agreement between you and Quikle regarding the Service.',
      'Waiver: The failure of Quikle to enforce any right or provision of these Terms does not constitute a waiver of that right or provision.',
      'Assignment: Quikle may assign or transfer these Terms in connection with a merger, acquisition, or sale of assets. You may not assign your rights or obligations without Quikle\'s prior written consent.',
      'Governing Language: English is the governing language of these Terms. Any translations are provided for convenience only.',
      'Governing Law: These Terms are governed by and construed in accordance with the laws of the Republic of South Africa.',
    ],
  },
  {
    icon: Mail,
    title: '21. Contact Information',
    items: [
      'Legal Entity: Quikle (Pty) Ltd, registered in the Republic of South Africa.',
      'General Enquiries & Support: support@quikle.com',
      'Legal Matters: legal@quikle.com',
      'POPIA & Privacy Queries: privacy@quikle.com',
    ],
  },
];

const LEGAL_REFERENCES = [
  { legislation: 'Protection of Personal Information Act (POPIA)', act: 'Act 4 of 2013', relevance: 'Data protection, consent, breach notification' },
  { legislation: 'Electronic Communications & Transactions Act (ECT Act)', act: 'Act 25 of 2002', relevance: 'Electronic agreements, digital signatures' },
  { legislation: 'Consumer Protection Act (CPA)', act: 'Act 68 of 2008', relevance: 'Consumer rights, fair terms' },
  { legislation: 'Companies Act', act: 'Act 71 of 2008', relevance: 'Corporate liability, entity obligations' },
];

const TermsOfService = () => {
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
        <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
        <p className="text-muted-foreground mt-1">
          Quikle CRM — Terms of Service Agreement
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            Effective: March 2026
          </Badge>
          <Badge variant="outline" className="text-xs">
            Governed by South African Law
          </Badge>
        </div>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Scale className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-foreground">Legal Agreement</p>
            <p className="text-sm text-muted-foreground">
              These Terms of Service, together with the{' '}
              <Link to="/cancellation-policy" className="text-primary hover:underline">
                Cancellation Policy
              </Link>
              {' '}and Privacy Policy, constitute the entire agreement between you and Quikle (Pty) Ltd. 
              By using the Service, you agree to be bound by these Terms.
            </p>
          </div>
        </CardContent>
      </Card>

      {TOS_SECTIONS.map((section, index) => (
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
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <Landmark className="h-5 w-5 text-primary" />
            South African Legal References
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-medium text-foreground">Legislation</th>
                  <th className="text-left py-2 pr-4 font-medium text-foreground">Reference</th>
                  <th className="text-left py-2 font-medium text-foreground">Relevance</th>
                </tr>
              </thead>
              <tbody>
                {LEGAL_REFERENCES.map((ref, index) => (
                  <tr key={index} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 pr-4 text-muted-foreground">{ref.legislation}</td>
                    <td className="py-2.5 pr-4">
                      <Badge variant="secondary" className="text-xs font-normal">{ref.act}</Badge>
                    </td>
                    <td className="py-2.5 text-muted-foreground">{ref.relevance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-start gap-3">
          <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-sm text-foreground">Questions about these Terms?</p>
            <p className="text-xs text-muted-foreground">
              Contact our legal team at{' '}
              <a href="mailto:legal@quikle.com" className="text-primary hover:underline">
                legal@quikle.com
              </a>{' '}
              or our support team at{' '}
              <a href="mailto:support@quikle.com" className="text-primary hover:underline">
                support@quikle.com
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsOfService;
