
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
        <h2 className="text-2xl font-bold">Pipeline Settings</h2>
        <p className="text-muted-foreground">
          Configure your pipeline behavior and automation preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Pipeline Settings</CardTitle>
          <CardDescription>Configure how customers move through your pipeline</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-assign new customers</Label>
              <p className="text-sm text-muted-foreground">
                Automatically assign new customers to available team members
              </p>
            </div>
            <Switch
              checked={settings.autoAssignCustomers}
              onCheckedChange={(checked) => handleSettingChange('autoAssignCustomers', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-move stale customers</Label>
              <p className="text-sm text-muted-foreground">
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
              <Label htmlFor="staleDays">Days before moving stale customers</Label>
              <Input
                id="staleDays"
                type="number"
                value={settings.staleCustomerDays}
                onChange={(e) => handleSettingChange('staleCustomerDays', parseInt(e.target.value))}
                className="w-32"
              />
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require approval for stage moves</Label>
              <p className="text-sm text-muted-foreground">
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

      <Card>
        <CardHeader>
          <CardTitle>Ticket Pipeline Settings</CardTitle>
          <CardDescription>Configure ticket workflow preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="defaultPriority">Default ticket priority</Label>
            <Select
              value={settings.defaultTicketPriority}
              onValueChange={(value) => handleSettingChange('defaultTicketPriority', value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable real-time notifications</Label>
              <p className="text-sm text-muted-foreground">
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

      <Card>
        <CardHeader>
          <CardTitle>Pipeline Customization</CardTitle>
          <CardDescription>Control pipeline structure and behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow custom stages</Label>
              <p className="text-sm text-muted-foreground">
                Let users create and modify pipeline stages
              </p>
            </div>
            <Switch
              checked={settings.allowCustomStages}
              onCheckedChange={(checked) => handleSettingChange('allowCustomStages', checked)}
            />
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="maxStages">Maximum stages per pipeline</Label>
            <Input
              id="maxStages"
              type="number"
              value={settings.maxStagesPerPipeline}
              onChange={(e) => handleSettingChange('maxStagesPerPipeline', parseInt(e.target.value))}
              className="w-32"
              min="3"
              max="15"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default PipelineSettings;
