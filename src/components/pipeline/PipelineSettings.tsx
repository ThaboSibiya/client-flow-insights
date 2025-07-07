
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Save, AlertTriangle, Clock, Target, Zap } from "lucide-react";

const PipelineSettings = () => {
  const [settings, setSettings] = useState({
    // General Pipeline Settings
    enableAutoProgression: true,
    defaultTimeLimit: 7,
    enableNotifications: true,
    enableAnalytics: true,
    
    // Stage Progression Rules
    customerProgressionRules: {
      enabled: true,
      timeBasedProgression: true,
      conditionBasedProgression: true,
      requireApproval: false
    },
    
    ticketProgressionRules: {
      enabled: true,
      timeBasedProgression: true,
      conditionBasedProgression: true,
      requireApproval: true
    },
    
    // Bottleneck Detection
    bottleneckDetection: {
      enabled: true,
      threshold: 5,
      timeThreshold: 7,
      notifyManagers: true
    },
    
    // Probability Scoring
    probabilityScoring: {
      enabled: true,
      algorithm: 'time-weighted',
      updateFrequency: 'daily'
    }
  });

  const handleSave = () => {
    console.log('Saving pipeline settings:', settings);
    // In a real app, this would save to backend
  };

  const updateSetting = (path: string, value: any) => {
    const keys = path.split('.');
    setSettings(prev => {
      const newSettings = { ...prev };
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-quikle-charcoal">Pipeline Settings</h2>
          <p className="text-quikle-slate">
            Configure automation rules, progression settings, and performance monitoring.
          </p>
        </div>
        <Button onClick={handleSave} className="bg-quikle-primary text-white">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              General Pipeline Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-progression">Enable Auto-Progression</Label>
              <Switch
                id="auto-progression"
                checked={settings.enableAutoProgression}
                onCheckedChange={(value) => updateSetting('enableAutoProgression', value)}
              />
            </div>

            <div>
              <Label htmlFor="time-limit">Default Time Limit (days)</Label>
              <Input
                id="time-limit"
                type="number"
                value={settings.defaultTimeLimit}
                onChange={(e) => updateSetting('defaultTimeLimit', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Enable Notifications</Label>
              <Switch
                id="notifications"
                checked={settings.enableNotifications}
                onCheckedChange={(value) => updateSetting('enableNotifications', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="analytics">Enable Analytics</Label>
              <Switch
                id="analytics"
                checked={settings.enableAnalytics}
                onCheckedChange={(value) => updateSetting('enableAnalytics', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bottleneck Detection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Bottleneck Detection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="bottleneck-enabled">Enable Detection</Label>
              <Switch
                id="bottleneck-enabled"
                checked={settings.bottleneckDetection.enabled}
                onCheckedChange={(value) => updateSetting('bottleneckDetection.enabled', value)}
              />
            </div>

            <div>
              <Label htmlFor="item-threshold">Item Count Threshold</Label>
              <Input
                id="item-threshold"
                type="number"
                value={settings.bottleneckDetection.threshold}
                onChange={(e) => updateSetting('bottleneckDetection.threshold', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="time-threshold">Time Threshold (days)</Label>
              <Input
                id="time-threshold"
                type="number"
                value={settings.bottleneckDetection.timeThreshold}
                onChange={(e) => updateSetting('bottleneckDetection.timeThreshold', parseInt(e.target.value))}
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="notify-managers">Notify Managers</Label>
              <Switch
                id="notify-managers"
                checked={settings.bottleneckDetection.notifyManagers}
                onCheckedChange={(value) => updateSetting('bottleneckDetection.notifyManagers', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Customer Progression Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Customer Progression Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="customer-enabled">Enable Customer Automation</Label>
              <Switch
                id="customer-enabled"
                checked={settings.customerProgressionRules.enabled}
                onCheckedChange={(value) => updateSetting('customerProgressionRules.enabled', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="customer-time-based">Time-Based Progression</Label>
              <Switch
                id="customer-time-based"
                checked={settings.customerProgressionRules.timeBasedProgression}
                onCheckedChange={(value) => updateSetting('customerProgressionRules.timeBasedProgression', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="customer-condition-based">Condition-Based Progression</Label>
              <Switch
                id="customer-condition-based"
                checked={settings.customerProgressionRules.conditionBasedProgression}
                onCheckedChange={(value) => updateSetting('customerProgressionRules.conditionBasedProgression', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="customer-approval">Require Manager Approval</Label>
              <Switch
                id="customer-approval"
                checked={settings.customerProgressionRules.requireApproval}
                onCheckedChange={(value) => updateSetting('customerProgressionRules.requireApproval', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Ticket Progression Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Ticket Progression Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="ticket-enabled">Enable Ticket Automation</Label>
              <Switch
                id="ticket-enabled"
                checked={settings.ticketProgressionRules.enabled}
                onCheckedChange={(value) => updateSetting('ticketProgressionRules.enabled', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="ticket-time-based">Time-Based Progression</Label>
              <Switch
                id="ticket-time-based"
                checked={settings.ticketProgressionRules.timeBasedProgression}
                onCheckedChange={(value) => updateSetting('ticketProgressionRules.timeBasedProgression', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="ticket-condition-based">Condition-Based Progression</Label>
              <Switch
                id="ticket-condition-based"
                checked={settings.ticketProgressionRules.conditionBasedProgression}
                onCheckedChange={(value) => updateSetting('ticketProgressionRules.conditionBasedProgression', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="ticket-approval">Require Manager Approval</Label>
              <Switch
                id="ticket-approval"
                checked={settings.ticketProgressionRules.requireApproval}
                onCheckedChange={(value) => updateSetting('ticketProgressionRules.requireApproval', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Probability Scoring */}
        <Card>
          <CardHeader>
            <CardTitle>Probability Scoring & Forecasting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="probability-enabled">Enable Probability Scoring</Label>
              <Switch
                id="probability-enabled"
                checked={settings.probabilityScoring.enabled}
                onCheckedChange={(value) => updateSetting('probabilityScoring.enabled', value)}
              />
            </div>

            <div>
              <Label htmlFor="algorithm">Scoring Algorithm</Label>
              <Select 
                value={settings.probabilityScoring.algorithm}
                onValueChange={(value) => updateSetting('probabilityScoring.algorithm', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="time-weighted">Time-Weighted</SelectItem>
                  <SelectItem value="activity-based">Activity-Based</SelectItem>
                  <SelectItem value="combined">Combined Score</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="update-frequency">Update Frequency</Label>
              <Select 
                value={settings.probabilityScoring.updateFrequency}
                onValueChange={(value) => updateSetting('probabilityScoring.updateFrequency', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Performance Targets */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Targets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Goals</Label>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Customer Conversion: 85%</Badge>
                <Badge variant="outline">Ticket Resolution: 24h</Badge>
                <Badge variant="outline">Stage Progression: 95%</Badge>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Automation Impact</Label>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Time saved per week: ~47 hours</p>
                <p>• Conversion rate improvement: +12%</p>
                <p>• Faster stage progression: +34%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PipelineSettings;
