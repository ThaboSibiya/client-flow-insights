import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Clock, Shuffle, Trophy, Eye, Zap } from "lucide-react";
import StaleLeadSettings from '../settings/StaleLeadSettings';
import LeadRoutingSettings from '../settings/LeadRoutingSettings';
import WinLossSettings from '../settings/WinLossSettings';
import PipelineDisplaySettings from '../settings/PipelineDisplaySettings';
import StageAutomationSettings from '../settings/StageAutomationSettings';

interface PipelineSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SECTIONS = [
  { value: 'stale-leads', icon: Clock, iconColor: 'text-amber-500', label: 'Stale Lead Detection', Component: StaleLeadSettings },
  { value: 'lead-routing', icon: Shuffle, iconColor: 'text-blue-500', label: 'Lead Routing & Assignment', Component: LeadRoutingSettings },
  { value: 'stage-automations', icon: Zap, iconColor: 'text-amber-500', label: 'Stage Automations', Component: StageAutomationSettings },
  { value: 'win-loss', icon: Trophy, iconColor: 'text-emerald-500', label: 'Win/Loss Tracking', Component: WinLossSettings },
  { value: 'display', icon: Eye, iconColor: 'text-violet-500', label: 'Display Preferences', Component: PipelineDisplaySettings },
] as const;

const PipelineSettingsModal = ({ open, onOpenChange }: PipelineSettingsModalProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Pipeline Settings</SheetTitle>
          <SheetDescription>
            Configure pipeline behavior, lead routing, and display preferences.
            Settings are saved per-section.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Accordion type="single" collapsible defaultValue="stale-leads" className="w-full">
            {SECTIONS.map(({ value, icon: Icon, iconColor, label, Component }) => (
              <AccordionItem key={value} value={value}>
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                    {label}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Component />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PipelineSettingsModal;
