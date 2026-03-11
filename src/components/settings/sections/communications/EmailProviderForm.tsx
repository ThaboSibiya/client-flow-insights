import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle,
  AlertCircle,
  Send,
  ExternalLink,
  Loader2,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { EmailProviderConfig } from '@/hooks/useCommunicationSettings';

export interface ExtraField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'select';
  placeholder?: string;
  hint?: string;
  options?: { value: string; label: string }[];
}

export interface ProviderLink {
  label: string;
  url: string;
}

interface EmailProviderFormProps {
  providerName: string;
  providerKey: string;
  config: EmailProviderConfig;
  update: <K extends keyof EmailProviderConfig>(key: K, value: EmailProviderConfig[K]) => void;
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

const EmailProviderForm: React.FC<EmailProviderFormProps> = ({
  providerName,
  providerKey,
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
  const [testEmail, setTestEmail] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = async () => {
    await save();
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast({ title: 'Email required', description: 'Enter a test email address.', variant: 'destructive' });
      return;
    }
    setIsTesting(true);
    try {
      const { error } = await supabase.functions.invoke('send-transactional-email', {
        body: {
          to: testEmail,
          subject: `${providerName} Integration Test`,
          message: `<h2>Email Integration Test</h2><p>This is a test email from your business management system via <strong>${providerName}</strong>.</p><p><strong>Time:</strong> ${new Date().toLocaleString('en-ZA')}</p>`,
          senderName: config.fromName || 'Your Business',
        },
      });
      if (error) throw error;
      toast({ title: 'Test email sent', description: `Successfully sent to ${testEmail}` });
    } catch (err: any) {
      toast({ title: 'Test failed', description: err.message || 'Failed to send test email', variant: 'destructive' });
    } finally {
      setIsTesting(false);
    }
  };

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

      {/* Setup note */}
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
            Allow this provider to send emails on your behalf
          </p>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(v) => update('enabled', v)}
        />
      </div>

      {/* Provider-specific extras */}
      {extraFields.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground">{providerName} Credentials</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {extraFields.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={`extra-${field.key}`} className="text-sm">{field.label}</Label>
                {field.type === 'select' ? (
                  <Select
                    value={config.extras[field.key] || field.options?.[0]?.value || ''}
                    onValueChange={(v) => updateExtra(field.key, v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={`extra-${field.key}`}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={config.extras[field.key] || ''}
                    onChange={(e) => updateExtra(field.key, e.target.value)}
                  />
                )}
                {field.hint && <p className="text-xs text-muted-foreground">{field.hint}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Common sender settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground">Sender Information</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Business Name</Label>
            <Input
              placeholder="Your Business Name"
              value={config.fromName}
              onChange={(e) => update('fromName', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">From Email</Label>
            <Input
              type="email"
              placeholder="noreply@yourbusiness.co.za"
              value={config.fromEmail}
              onChange={(e) => update('fromEmail', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Must be verified with your provider</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Reply-To Email</Label>
          <Input
            type="email"
            placeholder="support@yourbusiness.co.za"
            value={config.replyToEmail}
            onChange={(e) => update('replyToEmail', e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Email Signature</Label>
          <Textarea
            placeholder={'Best regards,\nYour Business Name\nsupport@yourbusiness.co.za\n+27 11 123 4567'}
            value={config.emailSignature}
            onChange={(e) => update('emailSignature', e.target.value)}
            rows={4}
          />
        </div>
      </div>

      <Separator />

      {/* Test email */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Test Integration</h4>
        <div className="flex gap-2">
          <Input
            placeholder="test@example.com"
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="flex-1"
          />
          <Button onClick={sendTestEmail} disabled={isTesting || !testEmail} variant="outline">
            {isTesting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            {isTesting ? 'Sending…' : 'Send Test'}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Footer actions */}
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
        <Button onClick={handleSave} disabled={!isDirty || isSaving}>
          {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {isSaving ? 'Saving…' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default EmailProviderForm;
