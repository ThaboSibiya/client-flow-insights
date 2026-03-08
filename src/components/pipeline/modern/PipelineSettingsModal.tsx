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
import { MessageSquare, Mail } from "lucide-react";
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
            Configure communication integrations for your pipeline
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
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PipelineSettingsModal;
