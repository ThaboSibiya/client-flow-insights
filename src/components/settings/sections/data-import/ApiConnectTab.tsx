import React from 'react';
import { Plug, Clock, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CRMS = [
  { name: 'HubSpot', desc: 'Contacts, deals, tickets' },
  { name: 'Salesforce', desc: 'Leads, accounts, opportunities' },
  { name: 'Zoho CRM', desc: 'Contacts, leads, deals' },
  { name: 'Pipedrive', desc: 'People, organizations, deals' },
];

const ApiConnectTab = () => (
  <div className="space-y-4">
    <Alert className="border-muted">
      <Plug className="h-4 w-4" />
      <AlertDescription>
        Connect directly to your CRM's API for automated, scheduled imports without manual exports.
      </AlertDescription>
    </Alert>

    <div className="grid gap-3 sm:grid-cols-2">
      {CRMS.map(crm => (
        <Card key={crm.name} className="transition-all hover:shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <h4 className="font-medium text-sm text-foreground">{crm.name}</h4>
              <p className="text-xs text-muted-foreground">{crm.desc}</p>
            </div>
            <Badge variant="secondary" className="text-[10px] whitespace-nowrap">Coming Soon</Badge>
          </CardContent>
        </Card>
      ))}
    </div>

    <Card className="border-dashed">
      <CardContent className="p-6 text-center space-y-3">
        <div className="p-2.5 rounded-full bg-muted w-fit mx-auto">
          <Clock className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h4 className="font-medium text-foreground text-sm">Scheduled Imports</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Auto-sync daily or weekly once connected to keep data fresh.
          </p>
        </div>
        <Badge variant="secondary" className="text-[10px]">Coming Soon</Badge>
      </CardContent>
    </Card>

    <Alert className="border-muted">
      <HelpCircle className="h-4 w-4" />
      <AlertDescription className="text-xs">
        <strong>In the meantime:</strong> Use the Import tab for CSV/Excel uploads, or use{' '}
        <strong>Integrations → Webhooks</strong> to push data from Zapier, Make, or N8N.
      </AlertDescription>
    </Alert>
  </div>
);

export default ApiConnectTab;
