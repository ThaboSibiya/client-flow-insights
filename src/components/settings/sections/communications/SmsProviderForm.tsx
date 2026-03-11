import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ExternalLink, Info, Loader2 } from 'lucide-react';
import type { SmsProviderConfig } from '@/hooks/useCommunicationSettings';
import type { ExtraField, ProviderLink } from './EmailProviderForm';

interface SmsProviderFormProps {
  providerName: string;
  config: SmsProviderConfig;
  update: <K extends keyof SmsProviderConfig>(key: K, value: SmsProviderConfig[K]) => void;
  updateExtra: (key: string, value: string) => void;
  save: () => Promise<void>;
  isDirty: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isActiveProvider: boolean;
  onSetActive: () => void;
  onBack: () => void;
  extraFields?: ExtraField[];
  links?: ProviderLink[];
  setupNote?: string;
}

const SmsProviderForm: React.FC<SmsProviderFormProps> = ({
  providerName,
  config,
  update,
  updateExtra,
  save,
  isDirty,
  isLoading,
  isSaving,
  isActiveProvider,
  onSetActive,
  onBack,
  extraFields = [],
  links = [],
  setupNote,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to providers
        </button>
        <div className="flex items-center gap-2">
          {isActiveProvider ? (
            <Badge className="bg-emerald-600 text-white">Active Provider</Badge>
          ) : (
            <Button variant="outline" size="sm" onClick={onSetActive}>
              Set as Active
            </Button>
          )}
        </div>
      </div>

      {setupNote && (
        <div className="flex gap-3 rounded-lg border border-border bg-muted/50 p-4">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="text-sm text-muted-foreground">{setupNote}</div>
        </div>
      )}

      {/* Enable toggle */}
      <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-card">
        <div>
          <Label className="text-sm font-medium">Enable {providerName}</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Allow this provider to send SMS from your automations
          </p>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(v) => update('enabled', v)}
        />
      </div>

      {/* Phone number */}
      <div className="space-y-1.5">
        <Label className="text-sm">{providerName} Phone Number</Label>
        <Input
          placeholder="+15017122661"
          value={config.phoneNumber}
          onChange={(e) => update('phoneNumber', e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          The phone number registered with your {providerName} account (E.164 format)
        </p>
      </div>

      {/* Extras */}
      {extraFields.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">{providerName} Credentials</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {extraFields.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-sm">{field.label}</Label>
                  <Input
                    type={field.type}
                    placeholder={field.placeholder}
                    value={config.extras[field.key] || ''}
                    onChange={(e) => updateExtra(field.key, e.target.value)}
                  />
                  {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <Button
              key={link.url}
              variant="outline"
              size="sm"
              onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              {link.label}
            </Button>
          ))}
        </div>
        <Button onClick={save} disabled={!isDirty || isSaving}>
          {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {isSaving ? 'Saving…' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default SmsProviderForm;
