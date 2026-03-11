import React from 'react';
import StaleLeadSettings from './settings/StaleLeadSettings';
import LeadRoutingSettings from './settings/LeadRoutingSettings';
import WinLossSettings from './settings/WinLossSettings';
import PipelineDisplaySettings from './settings/PipelineDisplaySettings';
import StageAutomationSettings from './settings/StageAutomationSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Shuffle, Zap, Trophy, Eye } from 'lucide-react';

const SECTIONS = [
  { icon: Clock, iconColor: 'text-amber-500', title: 'Stale Lead Detection', Component: StaleLeadSettings },
  { icon: Shuffle, iconColor: 'text-blue-500', title: 'Lead Routing & Assignment', Component: LeadRoutingSettings },
  { icon: Zap, iconColor: 'text-amber-500', title: 'Stage Automations', Component: StageAutomationSettings },
  { icon: Trophy, iconColor: 'text-emerald-500', title: 'Win/Loss Tracking', Component: WinLossSettings },
  { icon: Eye, iconColor: 'text-violet-500', title: 'Display Preferences', Component: PipelineDisplaySettings },
] as const;

const PipelineSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Pipeline Settings</h2>
        <p className="text-muted-foreground">
          Configure pipeline behavior, lead management, and display preferences.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {SECTIONS.map(({ icon: Icon, iconColor, title, Component }) => (
          <Card key={title}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon className={`h-4 w-4 ${iconColor}`} />
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Component />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PipelineSettings;
