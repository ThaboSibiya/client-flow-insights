import React, { useState } from 'react';
import { Plug, Clock, HelpCircle, Bell, CheckCircle2, ArrowRight, RefreshCw, Shield, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const CRMS = [
  { name: 'HubSpot', desc: 'Contacts, deals, tickets, companies', icon: '🟠', popular: true },
  { name: 'Salesforce', desc: 'Leads, accounts, opportunities, cases', icon: '☁️', popular: true },
  { name: 'Zoho CRM', desc: 'Contacts, leads, deals, accounts', icon: '🔵', popular: false },
  { name: 'Pipedrive', desc: 'People, organizations, deals, activities', icon: '🟢', popular: false },
  { name: 'Freshsales', desc: 'Contacts, deals, accounts, tasks', icon: '🟣', popular: false },
  { name: 'Monday CRM', desc: 'Leads, contacts, deals, activities', icon: '🔴', popular: false },
];

const FEATURES = [
  { icon: RefreshCw, title: 'Auto-Sync', desc: 'Daily or weekly scheduled imports' },
  { icon: Shield, title: 'Secure OAuth', desc: 'Industry-standard authentication' },
  { icon: Zap, title: 'Real-Time', desc: 'Instant change detection support' },
];

const ApiConnectTab = () => {
  const [notifiedCrms, setNotifiedCrms] = useState<Set<string>>(new Set());

  const handleNotify = (crmName: string) => {
    setNotifiedCrms(prev => {
      const next = new Set(prev);
      if (next.has(crmName)) {
        next.delete(crmName);
        toast.info(`Removed notification for ${crmName}`);
      } else {
        next.add(crmName);
        toast.success(`We'll notify you when ${crmName} integration is ready!`);
      }
      return next;
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
            <Plug className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Direct CRM Connections</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Connect directly to your CRM's API for automated, scheduled imports — no manual CSV exports needed. 
              Get notified when your preferred CRM is supported.
            </p>
          </div>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-3 gap-3">
        {FEATURES.map(feature => (
          <div key={feature.title} className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/30 border border-border/50">
            <feature.icon className="h-4 w-4 text-primary mb-1.5" />
            <span className="text-xs font-medium text-foreground">{feature.title}</span>
            <span className="text-[10px] text-muted-foreground mt-0.5">{feature.desc}</span>
          </div>
        ))}
      </div>

      {/* CRM Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-foreground">Supported Platforms</h4>
          <Badge variant="outline" className="text-[10px] text-muted-foreground border-muted-foreground/30">
            <Clock className="h-3 w-3 mr-1" />
            Coming Q3 2026
          </Badge>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {CRMS.map(crm => {
            const isNotified = notifiedCrms.has(crm.name);
            return (
              <Card 
                key={crm.name} 
                className="transition-all hover:shadow-sm hover:border-primary/20 group"
              >
                <CardContent className="p-3.5 flex items-center gap-3">
                  <span className="text-xl shrink-0" role="img" aria-label={crm.name}>
                    {crm.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-medium text-sm text-foreground">{crm.name}</h4>
                      {crm.popular && (
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0">Popular</Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{crm.desc}</p>
                  </div>
                  <Button
                    variant={isNotified ? 'secondary' : 'outline'}
                    size="sm"
                    className="shrink-0 h-7 text-[11px] gap-1"
                    onClick={() => handleNotify(crm.name)}
                  >
                    {isNotified ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        Notified
                      </>
                    ) : (
                      <>
                        <Bell className="h-3 w-3" />
                        Notify Me
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Scheduled imports card */}
      <Card className="border-dashed border-primary/20">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="p-2.5 rounded-full bg-primary/10 shrink-0">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-foreground text-sm">Scheduled Auto-Sync</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Set daily or weekly sync schedules to automatically import new and updated records from your CRM.
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] whitespace-nowrap text-muted-foreground border-muted-foreground/30">
            Coming Soon
          </Badge>
        </CardContent>
      </Card>

      {/* In the meantime */}
      <Alert className="border-muted bg-muted/30">
        <HelpCircle className="h-4 w-4 text-muted-foreground" />
        <AlertDescription className="text-xs text-muted-foreground">
          <strong className="text-foreground">In the meantime:</strong> Use the{' '}
          <strong className="text-foreground">Import</strong> tab for CSV/Excel uploads, or use{' '}
          <strong className="text-foreground">Integrations → Webhooks</strong> to push data from Zapier, Make, or N8N.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ApiConnectTab;
