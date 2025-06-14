
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Bell, Mail, Monitor, Volume2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

const NotificationSettings = () => {
  const { preferences, loading, updatePreferences } = useNotifications();

  if (loading || !preferences) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleToggle = (key: keyof typeof preferences, value: boolean) => {
    updatePreferences({ [key]: value });
  };

  const handleFrequencyChange = (frequency: string) => {
    updatePreferences({ 
      notification_frequency: frequency as 'immediate' | 'hourly' | 'daily' | 'never' 
    });
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-quikle-neutral" />
              <Label htmlFor="email-notifications">Email Notifications</Label>
            </div>
            <Switch
              id="email-notifications"
              checked={preferences.email_notifications}
              onCheckedChange={(checked) => handleToggle('email_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-quikle-neutral" />
              <Label htmlFor="desktop-notifications">Desktop Notifications</Label>
            </div>
            <Switch
              id="desktop-notifications"
              checked={preferences.desktop_notifications}
              onCheckedChange={(checked) => handleToggle('desktop_notifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-quikle-neutral" />
              <Label htmlFor="sound-notifications">Sound Notifications</Label>
            </div>
            <Switch
              id="sound-notifications"
              checked={preferences.sound_notifications}
              onCheckedChange={(checked) => handleToggle('sound_notifications', checked)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Notification Frequency</Label>
          <Select value={preferences.notification_frequency} onValueChange={handleFrequencyChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediate</SelectItem>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="never">Never</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {preferences.desktop_notifications && 'Notification' in window && Notification.permission === 'default' && (
          <div className="bg-quikle-crystal p-4 rounded-lg">
            <p className="text-sm text-quikle-neutral mb-2">
              Enable browser notifications to receive desktop alerts.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={requestNotificationPermission}
            >
              Enable Browser Notifications
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
