import React, { useState } from 'react';
import { Mail, Zap, Shield, Globe } from 'lucide-react';
import ProviderCard from './ProviderCard';
import EmailProviderForm from './EmailProviderForm';
import {
  useActiveEmailProvider,
  useResendSettings,
  useSendGridSettings,
  useMailgunSettings,
  usePostmarkSettings,
} from '@/hooks/useCommunicationSettings';
import type { ExtraField, ProviderLink } from './EmailProviderForm';

// ── Provider definitions ──────────────────────────────────────────────────────

interface ProviderDef {
  key: string;
  name: string;
  description: string;
  freeTier: string;
  icon: React.ReactNode;
  useHook: () => ReturnType<typeof useResendSettings>;
  extraFields: ExtraField[];
  links: ProviderLink[];
  setupNote: string;
}

const PROVIDERS: ProviderDef[] = [
  {
    key: 'resend',
    name: 'Resend',
    description: 'Modern email API with generous free tier. Already integrated with your Supabase setup.',
    freeTier: 'Free: 3,000 emails/month',
    icon: <Zap className="h-5 w-5" />,
    useHook: useResendSettings,
    extraFields: [],
    links: [
      { label: 'Dashboard', url: 'https://resend.com/domains' },
      { label: 'Verify Domain', url: 'https://resend.com/domains' },
    ],
    setupNote:
      'Resend is already configured via your Supabase project secrets (RESEND_API_KEY). Just set your sender details below.',
  },
  {
    key: 'sendgrid',
    name: 'SendGrid',
    description: 'Enterprise-grade delivery trusted by businesses worldwide. Excellent analytics.',
    freeTier: 'Free: 100 emails/day',
    icon: <Shield className="h-5 w-5" />,
    useHook: useSendGridSettings,
    extraFields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'SG.xxxxxxxxxxxx',
        hint: 'Add to Supabase secrets as SENDGRID_API_KEY for production use',
      },
    ],
    links: [
      { label: 'Get API Key', url: 'https://app.sendgrid.com/settings/api_keys' },
      { label: 'Verify Domain', url: 'https://app.sendgrid.com/settings/sender_auth' },
    ],
    setupNote:
      'To use SendGrid, create an account and add your API key. For production, store it as a Supabase secret.',
  },
  {
    key: 'mailgun',
    name: 'Mailgun',
    description: 'Developer-friendly API with EU region for compliance. Powerful analytics.',
    freeTier: 'Free: 5,000 emails (3 months)',
    icon: <Globe className="h-5 w-5" />,
    useHook: useMailgunSettings,
    extraFields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'key-xxxxxxxxxx',
        hint: 'Add to Supabase secrets as MAILGUN_API_KEY for production use',
      },
      {
        key: 'domain',
        label: 'Mailgun Domain',
        type: 'text',
        placeholder: 'mail.yourbusiness.co.za',
      },
      {
        key: 'region',
        label: 'Region',
        type: 'select',
        options: [
          { value: 'us', label: 'US (api.mailgun.net)' },
          { value: 'eu', label: 'EU (api.eu.mailgun.net) — Recommended' },
        ],
      },
    ],
    links: [
      { label: 'Get API Key', url: 'https://app.mailgun.com/app/account/security/api_keys' },
      { label: 'Setup Domain', url: 'https://app.mailgun.com/app/domains' },
    ],
    setupNote:
      'EU region is recommended for better connectivity and GDPR/POPIA compliance.',
  },
  {
    key: 'postmark',
    name: 'Postmark',
    description: 'Industry-leading deliverability (99%+) and 45-second average delivery time.',
    freeTier: 'From $15/month (10,000 emails)',
    icon: <Mail className="h-5 w-5" />,
    useHook: usePostmarkSettings,
    extraFields: [
      {
        key: 'serverToken',
        label: 'Server Token',
        type: 'password',
        placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        hint: 'Found in your Postmark server settings',
      },
      {
        key: 'messageStream',
        label: 'Message Stream',
        type: 'select',
        options: [
          { value: 'outbound', label: 'Outbound (Transactional)' },
          { value: 'broadcast', label: 'Broadcast (Marketing)' },
        ],
      },
    ],
    links: [
      { label: 'Get Token', url: 'https://postmarkapp.com/servers' },
      { label: 'Setup Domain', url: 'https://postmarkapp.com/domains' },
    ],
    setupNote:
      'Postmark excels at transactional emails. Create an account and add your server token below.',
  },
];

// ── Wrapper to call hooks at top level ────────────────────────────────────────

const ProviderFormWrapper: React.FC<{
  providerDef: ProviderDef;
  activeProvider: string;
  onSetActive: (key: string) => void;
  onBack: () => void;
}> = ({ providerDef, activeProvider, onSetActive, onBack }) => {
  const { config, update, updateExtra, save, isDirty, isLoading, isSaving } = providerDef.useHook();

  return (
    <EmailProviderForm
      providerName={providerDef.name}
      providerKey={providerDef.key}
      config={config}
      update={update}
      updateExtra={updateExtra}
      save={save}
      isDirty={isDirty}
      isLoading={isLoading}
      isSaving={isSaving}
      isActiveProvider={activeProvider === providerDef.key}
      onSetActive={() => onSetActive(providerDef.key)}
      onBack={onBack}
      extraFields={providerDef.extraFields}
      links={providerDef.links}
      setupNote={providerDef.setupNote}
    />
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const EmailProvidersSection: React.FC = () => {
  const { activeProvider, setActiveProvider } = useActiveEmailProvider();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  // We need to call all hooks unconditionally to satisfy React rules
  const resend = useResendSettings();
  const sendgrid = useSendGridSettings();
  const mailgun = useMailgunSettings();
  const postmark = usePostmarkSettings();

  const configMap: Record<string, { enabled: boolean }> = {
    resend: resend.config,
    sendgrid: sendgrid.config,
    mailgun: mailgun.config,
    postmark: postmark.config,
  };

  if (selectedProvider) {
    const def = PROVIDERS.find((p) => p.key === selectedProvider)!;
    return (
      <ProviderFormWrapper
        providerDef={def}
        activeProvider={activeProvider}
        onSetActive={async (key) => {
          await setActiveProvider(key);
        }}
        onBack={() => setSelectedProvider(null)}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-foreground">Email Provider</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Select and configure the email service for your business communications. Only one provider is active at a time.
        </p>
      </div>
      {PROVIDERS.map((p) => (
        <ProviderCard
          key={p.key}
          name={p.name}
          description={p.description}
          freeTier={p.freeTier}
          icon={p.icon}
          isActive={activeProvider === p.key}
          isConfigured={configMap[p.key]?.enabled || false}
          isSelected={false}
          onClick={() => setSelectedProvider(p.key)}
        />
      ))}
    </div>
  );
};

export default EmailProvidersSection;
