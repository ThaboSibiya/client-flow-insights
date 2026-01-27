
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Mail, Smartphone, Volume2, Clock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const NotificationSettings = () => {
  const { preferences, loading, updatePreferences } = useNotificationPreferences();
  const { toast } = useToast();

  const handleToggle = async (key: keyof typeof preferences, value: boolean) => {
    try {
      await updatePreferences({ [key]: value });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update notification preference.',
        variant: 'destructive',
      });
    }
  };

  const handleFrequencyChange = async (value: string) => {
    try {
      await updatePreferences({ notification_frequency: value as 'immediate' | 'hourly' | 'daily' | 'never' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update notification frequency.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-10 rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Delivery Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-quikle-primary" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-quikle-crystal/50 rounded-lg">
                <Mail className="h-4 w-4 text-quikle-primary" />
              </div>
              <div>
                <Label className="font-medium">Email Notifications</Label>
                <p className="text-sm text-quikle-slate/70">Receive updates via email</p>
              </div>
            </div>
            <Switch
              checked={preferences?.email_notifications ?? true}
              onCheckedChange={(checked) => handleToggle('email_notifications', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-quikle-crystal/50 rounded-lg">
                <Smartphone className="h-4 w-4 text-quikle-primary" />
              </div>
              <div>
                <Label className="font-medium">Push Notifications</Label>
                <p className="text-sm text-quikle-slate/70">Browser and mobile push alerts</p>
              </div>
            </div>
            <Switch
              checked={preferences?.push_notifications ?? true}
              onCheckedChange={(checked) => handleToggle('push_notifications', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-quikle-crystal/50 rounded-lg">
                <Volume2 className="h-4 w-4 text-quikle-primary" />
              </div>
              <div>
                <Label className="font-medium">Sound Notifications</Label>
                <p className="text-sm text-quikle-slate/70">Play sound for new alerts</p>
              </div>
            </div>
            <Switch
              checked={preferences?.sound_notifications ?? false}
              onCheckedChange={(checked) => handleToggle('sound_notifications', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-quikle-crystal/50 rounded-lg">
                <Bell className="h-4 w-4 text-quikle-primary" />
              </div>
              <div>
                <Label className="font-medium">Desktop Notifications</Label>
                <p className="text-sm text-quikle-slate/70">Show desktop alerts when not focused</p>
              </div>
            </div>
            <Switch
              checked={preferences?.desktop_notifications ?? true}
              onCheckedChange={(checked) => handleToggle('desktop_notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-quikle-primary" />
            Notification Frequency
          </CardTitle>
          <CardDescription>
            Control how often you receive notification digests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label className="min-w-[120px]">Digest Frequency</Label>
              <Select
                value={preferences?.notification_frequency || 'immediate'}
                onValueChange={handleFrequencyChange}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="hourly">Hourly Digest</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Digest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-quikle-slate/60">
              {preferences?.notification_frequency === 'immediate' 
                ? 'You will receive notifications as they happen.'
                : `You will receive a summary of notifications ${preferences?.notification_frequency || 'immediately'}.`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
