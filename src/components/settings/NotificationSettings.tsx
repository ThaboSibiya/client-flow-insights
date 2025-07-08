
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Bell, MessageSquare, Volume2 } from 'lucide-react';

const NotificationSettings = () => {
  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>New Customer Notifications</Label>
              <p className="text-sm text-quikle-slate">Get notified when new customers sign up</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Quote Status Updates</Label>
              <p className="text-sm text-quikle-slate">Notifications for quote approvals and rejections</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Payment Reminders</Label>
              <p className="text-sm text-quikle-slate">Automatic payment reminder emails</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="space-y-2">
            <Label>Daily Summary</Label>
            <Select defaultValue="8">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disabled">Disabled</SelectItem>
                <SelectItem value="6">6:00 AM</SelectItem>
                <SelectItem value="8">8:00 AM</SelectItem>
                <SelectItem value="10">10:00 AM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Urgent Messages</Label>
              <p className="text-sm text-quikle-slate">High priority notifications</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Task Reminders</Label>
              <p className="text-sm text-quikle-slate">Notifications for due tasks and follow-ups</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="space-y-2">
            <Label>Quiet Hours</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-sm">From</Label>
                <Input type="time" defaultValue="22:00" />
              </div>
              <div>
                <Label className="text-sm">Until</Label>
                <Input type="time" defaultValue="08:00" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4" />
            SMS Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Emergency Alerts</Label>
              <p className="text-sm text-quikle-slate">Critical system notifications via SMS</p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Appointment Reminders</Label>
              <p className="text-sm text-quikle-slate">SMS reminders for scheduled appointments</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Sound Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Volume2 className="h-4 w-4" />
            Sound Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notification Sounds</Label>
              <p className="text-sm text-quikle-slate">Play sound for notifications</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="space-y-2">
            <Label>Sound Theme</Label>
            <Select defaultValue="default">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save Notification Settings</Button>
      </div>
    </div>
  );
};

export default NotificationSettings;
