
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users } from 'lucide-react';
import { CustomerInsightsSettings } from '../types';

interface SurveySettingsProps {
  settings: CustomerInsightsSettings['satisfactionSurveys'];
  onUpdateSettings: (settings: CustomerInsightsSettings['satisfactionSurveys']) => void;
}

const SurveySettings = ({ settings, onUpdateSettings }: SurveySettingsProps) => {
  const updateSettings = (updates: Partial<CustomerInsightsSettings['satisfactionSurveys']>) => {
    onUpdateSettings({ ...settings, ...updates });
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          Survey Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-send">Automatically Send After Job Completion</Label>
          <Switch
            id="auto-send"
            checked={settings.autoSendAfterCompletion}
            onCheckedChange={(checked) => updateSettings({ autoSendAfterCompletion: checked })}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Survey Delay (hours)</Label>
            <Select 
              value={settings.surveyDelay.toString()} 
              onValueChange={(value) => updateSettings({ surveyDelay: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="2">2 hours</SelectItem>
                <SelectItem value="4">4 hours</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Reminder Frequency (days)</Label>
            <Select 
              value={settings.reminderFrequency.toString()} 
              onValueChange={(value) => updateSettings({ reminderFrequency: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Daily</SelectItem>
                <SelectItem value="3">Every 3 days</SelectItem>
                <SelectItem value="7">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Max Reminders</Label>
            <Select 
              value={settings.maxReminders.toString()} 
              onValueChange={(value) => updateSettings({ maxReminders: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SurveySettings;
