
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Save, RefreshCw } from "lucide-react";

const PipelineSettings = () => {
  const [settings, setSettings] = useState({
    autoAssignCustomers: true,
    autoMoveStaleCustomers: false,
    staleCustomerDays: 30,
    defaultTicketPriority: 'medium',
    enableNotifications: true,
    requireApprovalForStageMove: false,
    allowCustomStages: true,
    maxStagesPerPipeline: 8
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    console.log('Saving pipeline settings:', settings);
    // Here you would save the settings to your backend
  };

  const handleReset = () => {
    // Reset to default settings
    setSettings({
      autoAssignCustomers: true,
      autoMoveStaleCustomers: false,
      staleCustomerDays: 30,
      defaultTicketPriority: 'medium',
      enableNotifications: true,
      requireApprovalForStageMove: false,
      allowCustomStages: true,
      maxStagesPerPipeline: 8
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-quikle-charcoal">Pipeline Settings</h2>
        <p className="text-quikle-slate">
          Configure your pipeline behavior and automation preferences
        </p>
      </div>

      <Card className="border-quikle-silver/30">
        <CardHeader>
          <CardTitle className="text-quikle-charcoal">Customer Pipeline Settings</CardTitle>
          <CardDescription className="text-quikle-slate">Configure how customers move through your pipeline</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-quikle-charcoal">Auto-assign new customers</Label>
              <p className="text-sm text-quikle-slate">
                Automatically assign new customers to available team members
              </p>
            </div>
            <Switch
              checked={settings.autoAssignCustomers}
              onCheckedChange={(checked) => handleSettingChange('autoAssignCustomers', checked)}
            />
          </div>

          <Separator className="bg-quikle-silver/30" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-quikle-charcoal">Auto-move stale customers</Label>
              <p className="text-sm text-quikle-slate">
                Automatically move customers who haven't been contacted
              </p>
            </div>
            <Switch
              checked={settings.autoMoveStaleCustomers}
              onCheckedChange={(checked) => handleSettingChange('autoMoveStaleCustomers', checked)}
            />
          </div>

          {settings.autoMoveStaleCustomers && (
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="staleDays" className="text-quikle-charcoal">Days before moving stale customers</Label>
              <Input
                id="staleDays"
                type="number"
                value={settings.staleCustomerDays}
                onChange={(e) => handleSettingChange('staleCustomerDays', parseInt(e.target.value))}
                className="w-32 border-quikle-silver/50 text-quikle-charcoal"
              />
            </div>
          )}

          <Separator className="bg-quikle-silver/30" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-quikle-charcoal">Require approval for stage moves</Label>
              <p className="text-sm text-quikle-slate">
                Require manager approval when moving customers between stages
              </p>
            </div>
            <Switch
              checked={settings.requireApprovalForStageMove}
              onCheckedChange={(checked) => handleSettingChange('requireApprovalForStageMove', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-quikle-silver/30">
        <CardHeader>
          <CardTitle className="text-quikle-charcoal">Ticket Pipeline Settings</CardTitle>
          <CardDescription className="text-quikle-slate">Configure ticket workflow preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="defaultPriority" className="text-quikle-charcoal">Default ticket priority</Label>
            <Select
              value={settings.defaultTicketPriority}
              onValueChange={(value) => handleSettingChange('defaultTicketPriority', value)}
            >
              <SelectTrigger className="w-48 border-quikle-silver/50 text-quikle-charcoal">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-quikle-silver/30">
                <SelectItem value="low" className="text-quikle-charcoal hover:bg-quikle-crystal">Low</SelectItem>
                <SelectItem value="medium" className="text-quikle-charcoal hover:bg-quikle-crystal">Medium</SelectItem>
                <SelectItem value="high" className="text-quikle-charcoal hover:bg-quikle-crystal">High</SelectItem>
                <SelectItem value="urgent" className="text-quikle-charcoal hover:bg-quikle-crystal">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-quikle-silver/30" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-quikle-charcoal">Enable real-time notifications</Label>
              <p className="text-sm text-quikle-slate">
                Get notified when tickets move between stages
              </p>
            </div>
            <Switch
              checked={settings.enableNotifications}
              onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-quikle-silver/30">
        <CardHeader>
          <CardTitle className="text-quikle-charcoal">Pipeline Customization</CardTitle>
          <CardDescription className="text-quikle-slate">Control pipeline structure and behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-quikle-charcoal">Allow custom stages</Label>
              <p className="text-sm text-quikle-slate">
                Let users create and modify pipeline stages
              </p>
            </div>
            <Switch
              checked={settings.allowCustomStages}
              onCheckedChange={(checked) => handleSettingChange('allowCustomStages', checked)}
            />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="maxStages" className="text-quikle-charcoal">Maximum stages per pipeline</Label>
            <Input
              id="maxStages"
              type="number"
              value={settings.maxStagesPerPipeline}
              onChange={(e) => handleSettingChange('maxStagesPerPipeline', parseInt(e.target.value))}
              className="w-32 border-quikle-silver/50 text-quikle-charcoal"
              min="3"
              max="15"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleReset} className="border-quikle-silver/50 text-quikle-charcoal hover:bg-quikle-crystal">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} className="bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default PipelineSettings;
