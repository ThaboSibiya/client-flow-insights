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

const PipelineSettingsModal = ({ open, onOpenChange }: PipelineSettingsModalProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Pipeline Settings</SheetTitle>
          <SheetDescription>
            Configure pipeline behavior, lead routing, and display preferences
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Accordion type="single" collapsible defaultValue="stale-leads" className="w-full">
            <AccordionItem value="stale-leads">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  Stale Lead Detection
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <StaleLeadSettings />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="lead-routing">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Shuffle className="h-4 w-4 text-blue-500" />
                  Lead Routing & Assignment
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <LeadRoutingSettings />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="stage-automations">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Stage Automations
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <StageAutomationSettings />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="win-loss">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-emerald-500" />
                  Win/Loss Tracking
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <WinLossSettings />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="display">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-violet-500" />
                  Display Preferences
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <PipelineDisplaySettings />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PipelineSettingsModal;
