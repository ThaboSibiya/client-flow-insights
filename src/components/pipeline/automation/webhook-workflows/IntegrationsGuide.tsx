
import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { BookOpen, ChevronDown, Copy, Zap, Webhook, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

const IntegrationsGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  const steps = [
    {
      number: 1,
      icon: Webhook,
      title: 'Create an API Endpoint',
      description: 'Click "Create API Endpoint" and give it a name (e.g., "New Lead from Website").',
      example: {
        label: 'Example name',
        value: 'Website Contact Form',
      },
    },
    {
      number: 2,
      icon: Copy,
      title: 'Copy your unique URL',
      description: 'Each endpoint gets a unique URL. Click the copy button next to it.',
      example: {
        label: 'Your URL will look like',
        value: 'https://…/functions/v1/webhook-receiver/abc123',
      },
    },
    {
      number: 3,
      icon: ArrowRight,
      title: 'Paste it into your app',
      description: 'Use the URL in Zapier, Make, your website form, or any app that supports webhooks.',
      code: `// Example: Send data from your website\nfetch("YOUR_URL", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({\n    name: "Jane Doe",\n    email: "jane@example.com"\n  })\n});`,
    },
    {
      number: 4,
      icon: CheckCircle2,
      title: 'Test & go live',
      description: 'Click the ••• menu on your endpoint and select "Test" to send a sample request. Once confirmed, you\'re all set!',
      example: {
        label: 'Tip',
        value: 'Use the cURL snippet for quick terminal testing.',
      },
    },
  ];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3 transition-colors hover:bg-muted/50">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <BookOpen className="h-4 w-4 text-primary" />
            Quick Start Guide
          </div>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-3 rounded-lg border bg-card p-5 space-y-5">
          {/* Steps */}
          <div className="grid gap-4 sm:grid-cols-2">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative rounded-md border bg-background p-4 space-y-2"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                    {step.number}
                  </span>
                  <h4 className="text-sm font-semibold text-foreground">{step.title}</h4>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground pl-[34px]">
                  {step.description}
                </p>

                {step.example && (
                  <div className="ml-[34px] rounded border bg-muted/40 px-3 py-2">
                    <span className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {step.example.label}
                    </span>
                    <code className="text-xs text-foreground">{step.example.value}</code>
                  </div>
                )}

                {step.code && (
                  <div className="ml-[34px] rounded border bg-muted/40 px-3 py-2 overflow-x-auto">
                    <pre className="text-[11px] leading-relaxed text-foreground whitespace-pre font-mono">
                      {step.code}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Use-case examples */}
          <div className="border-t pt-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Common Use Cases
            </h4>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { icon: '🌐', title: 'Website Forms', desc: 'Capture leads from your contact or quote-request forms.' },
                { icon: '⚡', title: 'Zapier / Make', desc: 'Trigger CRM actions from 5,000+ apps automatically.' },
                { icon: '🔔', title: 'Notifications', desc: 'Receive real-time alerts when events happen externally.' },
              ].map((uc) => (
                <div key={uc.title} className="flex items-start gap-2.5 rounded-md border bg-background p-3">
                  <span className="text-base">{uc.icon}</span>
                  <div>
                    <span className="text-xs font-medium text-foreground">{uc.title}</span>
                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{uc.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default IntegrationsGuide;
