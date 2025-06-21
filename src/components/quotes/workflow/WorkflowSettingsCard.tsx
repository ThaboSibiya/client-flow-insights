
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Save } from "lucide-react";
import { toast } from '@/hooks/use-toast';

const WorkflowSettingsCard = () => {
  const [autoPDFGeneration, setAutoPDFGeneration] = useState(true);
  const [autoEmailSend, setAutoEmailSend] = useState(false);
  const [autoArchive, setAutoArchive] = useState(true);
  const [signatureReminder, setSignatureReminder] = useState(7);
  const [archiveDelay, setArchiveDelay] = useState('immediate');
  const [brandingTemplate, setBrandingTemplate] = useState('professional');

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Workflow settings have been updated successfully.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Workflow Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">Automation Settings</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-Generate PDFs</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically generate branded PDFs when quotes are created
                </p>
              </div>
              <Switch
                checked={autoPDFGeneration}
                onCheckedChange={setAutoPDFGeneration}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-Send Emails</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically send emails after PDF generation
                </p>
              </div>
              <Switch
                checked={autoEmailSend}
                onCheckedChange={setAutoEmailSend}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-Archive Completed</Label>
                <p className="text-sm text-muted-foreground">
                  Archive documents when workflow completes
                </p>
              </div>
              <Switch
                checked={autoArchive}
                onCheckedChange={setAutoArchive}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Timing Settings</h4>
            
            <div className="space-y-2">
              <Label>Signature Reminder (days)</Label>
              <Input
                type="number"
                value={signatureReminder}
                onChange={(e) => setSignatureReminder(Number(e.target.value))}
                min="1"
                max="30"
              />
              <p className="text-xs text-muted-foreground">
                Send reminder emails if signature is pending
              </p>
            </div>

            <div className="space-y-2">
              <Label>Archive Delay</Label>
              <Select value={archiveDelay} onValueChange={setArchiveDelay}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="1day">1 Day</SelectItem>
                  <SelectItem value="3days">3 Days</SelectItem>
                  <SelectItem value="7days">7 Days</SelectItem>
                  <SelectItem value="30days">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Default Branding Template</Label>
              <Select value={brandingTemplate} onValueChange={setBrandingTemplate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Integration Settings</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2">E-Signature Provider</h5>
              <Select defaultValue="docusign">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="docusign">DocuSign</SelectItem>
                  <SelectItem value="hellosign">HelloSign</SelectItem>
                  <SelectItem value="adobe">Adobe Sign</SelectItem>
                  <SelectItem value="pandadoc">PandaDoc</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 border rounded-lg">
              <h5 className="font-medium mb-2">Email Tracking</h5>
              <Select defaultValue="enabled">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                  <SelectItem value="basic">Basic Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSaveSettings}>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowSettingsCard;
