import { useCallback, useEffect, useState, useMemo } from 'react';
import { useCompanySetting } from '@/hooks/useCompanySettings';

// ── Shared types ──────────────────────────────────────────────────────────────

export interface EmailProviderConfig {
  enabled: boolean;
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
  emailSignature: string;
  /** Provider-specific extras stored as key-value pairs */
  extras: Record<string, string>;
}

export interface SmsProviderConfig {
  enabled: boolean;
  phoneNumber: string;
  extras: Record<string, string>;
}

export const EMAIL_PROVIDER_DEFAULTS: EmailProviderConfig = {
  enabled: false,
  fromName: '',
  fromEmail: '',
  replyToEmail: '',
  emailSignature: '',
  extras: {},
};

export const SMS_PROVIDER_DEFAULTS: SmsProviderConfig = {
  enabled: false,
  phoneNumber: '',
  extras: {},
};

// ── Active provider key ───────────────────────────────────────────────────────

export const useActiveEmailProvider = () => {
  const { setting, isLoading, updateSetting, isUpdating } = useCompanySetting('active_email_provider');
  return {
    activeProvider: (setting as string) || 'resend',
    isLoading,
    setActiveProvider: updateSetting,
    isUpdating,
  };
};

export const useActiveSmsProvider = () => {
  const { setting, isLoading, updateSetting, isUpdating } = useCompanySetting('active_sms_provider');
  return {
    activeProvider: (setting as string) || 'twilio',
    isLoading,
    setActiveProvider: updateSetting,
    isUpdating,
  };
};

// ── Generic provider settings hook ────────────────────────────────────────────

export function useProviderSetting<T extends object>(settingKey: string, defaults: T) {
  const { setting, isLoading, updateSetting, isUpdating } = useCompanySetting(settingKey);
  const [local, setLocal] = useState<T>(defaults);
  const [initialised, setInitialised] = useState(false);

  useEffect(() => {
    if (!isLoading && !initialised) {
      setLocal(setting ? { ...defaults, ...setting } : defaults);
      setInitialised(true);
    }
  }, [isLoading, setting, initialised, defaults]);

  const isDirty = useMemo(() => {
    if (!initialised) return false;
    const baseline = setting ? { ...defaults, ...setting } : defaults;
    return JSON.stringify(local) !== JSON.stringify(baseline);
  }, [local, setting, defaults, initialised]);

  const save = useCallback(async () => {
    await updateSetting(local);
  }, [local, updateSetting]);

  const update = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateExtra = useCallback((key: string, value: string) => {
    setLocal((prev) => ({
      ...prev,
      extras: { ...(prev as any).extras, [key]: value },
    }));
  }, []);

  return {
    config: local,
    update,
    updateExtra,
    save,
    isDirty,
    isLoading: !initialised,
    isSaving: isUpdating,
  };
}

// ── Convenience hooks ─────────────────────────────────────────────────────────

export const useResendSettings = () =>
  useProviderSetting<EmailProviderConfig>('email_provider_resend', EMAIL_PROVIDER_DEFAULTS);

export const useSendGridSettings = () =>
  useProviderSetting<EmailProviderConfig>('email_provider_sendgrid', EMAIL_PROVIDER_DEFAULTS);

export const useMailgunSettings = () =>
  useProviderSetting<EmailProviderConfig>('email_provider_mailgun', EMAIL_PROVIDER_DEFAULTS);

export const usePostmarkSettings = () =>
  useProviderSetting<EmailProviderConfig>('email_provider_postmark', EMAIL_PROVIDER_DEFAULTS);

export const useTwilioSmsSettings = () =>
  useProviderSetting<SmsProviderConfig>('sms_provider_twilio', SMS_PROVIDER_DEFAULTS);

export const useTelnyxSmsSettings = () =>
  useProviderSetting<SmsProviderConfig>('sms_provider_telnyx', SMS_PROVIDER_DEFAULTS);
