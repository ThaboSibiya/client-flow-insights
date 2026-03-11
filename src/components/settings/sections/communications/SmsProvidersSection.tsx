import React, { useState } from 'react';
import { MessageSquare, Phone } from 'lucide-react';
import ProviderCard from './ProviderCard';
import SmsProviderForm from './SmsProviderForm';
import {
  useActiveSmsProvider,
  useTwilioSmsSettings,
  useTelnyxSmsSettings,
} from '@/hooks/useCommunicationSettings';
import type { ExtraField, ProviderLink } from './EmailProviderForm';

interface SmsDef {
  key: string;
  name: string;
  description: string;
  freeTier: string;
  icon: React.ReactNode;
  useHook: () => ReturnType<typeof useTwilioSmsSettings>;
  extraFields: ExtraField[];
  links: ProviderLink[];
  setupNote: string;
}

const SMS_PROVIDERS: SmsDef[] = [
  {
    key: 'twilio',
    name: 'Twilio',
    description: 'Industry-leading cloud communications for SMS, voice and WhatsApp messaging.',
    freeTier: 'Pay-as-you-go from $0.0079/SMS',
    icon: <MessageSquare className="h-5 w-5" />,
    useHook: useTwilioSmsSettings,
    extraFields: [],
    links: [
      { label: 'Sign Up', url: 'https://www.twilio.com/try-twilio' },
      { label: 'Console', url: 'https://console.twilio.com' },
    ],
    setupNote:
      'Your Twilio Account SID and Auth Token are stored as Supabase secrets. Enter your Twilio phone number below.',
  },
  {
    key: 'telnyx',
    name: 'Telnyx',
    description: 'Global carrier with competitive rates and a developer-friendly API for messaging.',
    freeTier: 'Pay-as-you-go from $0.004/SMS',
    icon: <Phone className="h-5 w-5" />,
    useHook: useTelnyxSmsSettings,
    extraFields: [
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'KEY0123...',
        hint: 'Add to Supabase secrets as TELNYX_API_KEY for production use',
      },
    ],
    links: [
      { label: 'Sign Up', url: 'https://telnyx.com/sign-up' },
      { label: 'Portal', url: 'https://portal.telnyx.com' },
    ],
    setupNote:
      'Create a Telnyx account and enter your API key and phone number to start sending SMS.',
  },
];

const SmsFormWrapper: React.FC<{
  def: SmsDef;
  activeProvider: string;
  onSetActive: (key: string) => void;
  onBack: () => void;
}> = ({ def, activeProvider, onSetActive, onBack }) => {
  const { config, update, updateExtra, save, isDirty, isLoading, isSaving } = def.useHook();

  return (
    <SmsProviderForm
      providerName={def.name}
      config={config}
      update={update}
      updateExtra={updateExtra}
      save={save}
      isDirty={isDirty}
      isLoading={isLoading}
      isSaving={isSaving}
      isActiveProvider={activeProvider === def.key}
      onSetActive={() => onSetActive(def.key)}
      onBack={onBack}
      extraFields={def.extraFields}
      links={def.links}
      setupNote={def.setupNote}
    />
  );
};

const SmsProvidersSection: React.FC = () => {
  const { activeProvider, setActiveProvider } = useActiveSmsProvider();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const twilio = useTwilioSmsSettings();
  const telnyx = useTelnyxSmsSettings();

  const configMap: Record<string, { enabled: boolean }> = {
    twilio: twilio.config,
    telnyx: telnyx.config,
  };

  if (selectedProvider) {
    const def = SMS_PROVIDERS.find((p) => p.key === selectedProvider)!;
    return (
      <SmsFormWrapper
        def={def}
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
        <h3 className="text-sm font-semibold text-foreground">SMS Provider</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Choose your SMS gateway for customer messaging and automation triggers. Only one provider is active at a time.
        </p>
      </div>
      {SMS_PROVIDERS.map((p) => (
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

export default SmsProvidersSection;
