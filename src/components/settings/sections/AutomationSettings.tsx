
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Mail, Clock, Bell } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const AutomationSettings = () => {
  const [emailAutoSend, setEmailAutoSend] = React.useState(false);
  const [followUpEnabled, setFollowUpEnabled] = React.useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = React.useState(false);

  return (
    <div className="space-y-6">
      {/* Automation Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-quikle-primary" />
            Workflow Automations
          </CardTitle>
          <CardDescription>
            Configure automated workflows and triggers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Automation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-quikle-crystal/50 rounded-lg">
                <Mail className="h-4 w-4 text-quikle-primary" />
              </div>
              <div>
                <Label className="font-medium">Auto-Send Emails</Label>
                <p className="text-sm text-quikle-slate/70">
                  Automatically send quote and invoice emails
                </p>
              </div>
            </div>
            <Switch
              checked={emailAutoSend}
              onCheckedChange={setEmailAutoSend}
            />
          </div>

          <Separator />

          {/* Follow-up Automation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-quikle-crystal/50 rounded-lg">
                <Clock className="h-4 w-4 text-quikle-primary" />
              </div>
              <div>
                <Label className="font-medium">Automated Follow-ups</Label>
                <p className="text-sm text-quikle-slate/70">
                  Send reminder emails for pending quotes
                </p>
              </div>
            </div>
            <Switch
              checked={followUpEnabled}
              onCheckedChange={setFollowUpEnabled}
            />
          </div>

          {followUpEnabled && (
            <div className="ml-12 grid grid-cols-3 gap-4 p-4 bg-quikle-crystal/20 rounded-lg">
              <div>
                <Label className="text-xs">First Follow-up</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input type="number" defaultValue={3} className="w-16 h-8" />
                  <span className="text-sm text-quikle-slate/70">days</span>
                </div>
              </div>
              <div>
                <Label className="text-xs">Second Follow-up</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input type="number" defaultValue={7} className="w-16 h-8" />
                  <span className="text-sm text-quikle-slate/70">days</span>
                </div>
              </div>
              <div>
                <Label className="text-xs">Final Follow-up</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input type="number" defaultValue={14} className="w-16 h-8" />
                  <span className="text-sm text-quikle-slate/70">days</span>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* WhatsApp Automation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-quikle-crystal/50 rounded-lg">
                <Bell className="h-4 w-4 text-quikle-primary" />
              </div>
              <div>
                <Label className="font-medium">WhatsApp Notifications</Label>
                <p className="text-sm text-quikle-slate/70">
                  Send notifications via WhatsApp
                </p>
              </div>
            </div>
            <Switch
              checked={whatsappEnabled}
              onCheckedChange={setWhatsappEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Advanced Automations Link */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <Zap className="h-10 w-10 text-quikle-primary/60 mx-auto" />
            <div>
              <h4 className="font-medium text-quikle-charcoal">Need More Advanced Automations?</h4>
              <p className="text-sm text-quikle-slate/70 mt-1">
                Create custom workflows with our advanced automation builder
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/automations">Go to Automations</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationSettings;
