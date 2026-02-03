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
import { MessageSquare, Mail, Zap, Database } from "lucide-react";
import TwilioSettings from '../settings/TwilioSettings';
import EmailSettings from '../settings/EmailSettings';
import TelnyxSettings from '../settings/TelnyxSettings';

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
            Configure integrations and automation settings
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="sms-twilio">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Twilio SMS
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <TwilioSettings />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sms-telnyx">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Telnyx SMS
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <TelnyxSettings />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="email">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Settings
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <EmailSettings />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="automation">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Automation Rules
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-sm text-muted-foreground py-4">
                  Configure automation rules from individual stage settings.
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="data">
              <AccordionTrigger className="text-sm">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Data & Sync
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="text-sm text-muted-foreground py-4">
                  Data synchronization settings coming soon.
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PipelineSettingsModal;
