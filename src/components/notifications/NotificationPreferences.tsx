import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bell,
  Mail,
  Monitor,
  Volume2,
  Users,
  Ticket,
  FolderKanban,
  CheckSquare,
  Settings,
  Loader2,
} from 'lucide-react';
import { useNotificationPreferences, NotificationPreferences } from '@/hooks/useNotificationPreferences';
import { cn } from '@/lib/utils';

interface PreferenceSwitchProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

const PreferenceSwitch: React.FC<PreferenceSwitchProps> = ({
  icon,
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-accent/50 text-primary">
        {icon}
      </div>
      <div className="space-y-0.5">
        <Label className="text-sm font-medium text-foreground cursor-pointer">
          {label}
        </Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
    />
  </div>
);

const NotificationPreferencesPanel: React.FC = () => {
  const { preferences, loading, saving, updatePreferences, requestDesktopPermission } = useNotificationPreferences();

  const handleToggle = (key: keyof NotificationPreferences) => async (checked: boolean) => {
    if (key === 'desktop_notifications' && checked) {
      const hasPermission = await requestDesktopPermission();
      if (!hasPermission) return;
    }
    updatePreferences({ [key]: checked });
  };

  const handleFrequencyChange = (value: string) => {
    updatePreferences({ 
      notification_frequency: value as NotificationPreferences['notification_frequency'] 
    });
  };

  if (loading) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Notification Preferences</CardTitle>
              <CardDescription>Customize how you receive notifications</CardDescription>
            </div>
          </div>
          {saving && (
            <Badge variant="outline" className="text-primary border-primary/30">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Saving...
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Delivery Methods */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Delivery Methods
          </h4>
          <div className="space-y-1 rounded-lg border border-border/40 p-4 bg-muted/20">
            <PreferenceSwitch
              icon={<Mail className="h-4 w-4" />}
              label="Email Notifications"
              description="Receive notifications via email"
              checked={preferences.email_notifications}
              onCheckedChange={handleToggle('email_notifications')}
              disabled={saving}
            />
            <Separator className="bg-border/30" />
            <PreferenceSwitch
              icon={<Monitor className="h-4 w-4" />}
              label="Desktop Notifications"
              description="Show browser push notifications"
              checked={preferences.desktop_notifications}
              onCheckedChange={handleToggle('desktop_notifications')}
              disabled={saving}
            />
            <Separator className="bg-border/30" />
            <PreferenceSwitch
              icon={<Volume2 className="h-4 w-4" />}
              label="Sound Notifications"
              description="Play a sound for new notifications"
              checked={preferences.sound_notifications}
              onCheckedChange={handleToggle('sound_notifications')}
              disabled={saving}
            />
          </div>
        </div>

        {/* Notification Types */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <FolderKanban className="h-4 w-4" />
            Notification Types
          </h4>
          <div className="space-y-1 rounded-lg border border-border/40 p-4 bg-muted/20">
            <PreferenceSwitch
              icon={<Users className="h-4 w-4" />}
              label="Customer Updates"
              description="New customers and status changes"
              checked={preferences.customer_notifications}
              onCheckedChange={handleToggle('customer_notifications')}
              disabled={saving}
            />
            <Separator className="bg-border/30" />
            <PreferenceSwitch
              icon={<Ticket className="h-4 w-4" />}
              label="Ticket Updates"
              description="New tickets, assignments, and status changes"
              checked={preferences.ticket_notifications}
              onCheckedChange={handleToggle('ticket_notifications')}
              disabled={saving}
            />
            <Separator className="bg-border/30" />
            <PreferenceSwitch
              icon={<FolderKanban className="h-4 w-4" />}
              label="Project Updates"
              description="Project creation and status updates"
              checked={preferences.project_notifications}
              onCheckedChange={handleToggle('project_notifications')}
              disabled={saving}
            />
            <Separator className="bg-border/30" />
            <PreferenceSwitch
              icon={<CheckSquare className="h-4 w-4" />}
              label="Task Assignments"
              description="When tasks are assigned to you"
              checked={preferences.task_notifications}
              onCheckedChange={handleToggle('task_notifications')}
              disabled={saving}
            />
            <Separator className="bg-border/30" />
            <PreferenceSwitch
              icon={<Settings className="h-4 w-4" />}
              label="System Notifications"
              description="Important system updates and announcements"
              checked={preferences.system_notifications}
              onCheckedChange={handleToggle('system_notifications')}
              disabled={saving}
            />
          </div>
        </div>

        {/* Frequency */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">
            Notification Frequency
          </h4>
          <Select
            value={preferences.notification_frequency}
            onValueChange={handleFrequencyChange}
            disabled={saving}
          >
            <SelectTrigger className="w-full border-border/40">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediate</SelectItem>
              <SelectItem value="hourly">Hourly Digest</SelectItem>
              <SelectItem value="daily">Daily Digest</SelectItem>
              <SelectItem value="never">Never</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2">
            {preferences.notification_frequency === 'immediate' && 'Get notified as soon as events occur'}
            {preferences.notification_frequency === 'hourly' && 'Receive a summary every hour'}
            {preferences.notification_frequency === 'daily' && 'Receive a daily summary email'}
            {preferences.notification_frequency === 'never' && 'You won\'t receive any notifications'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferencesPanel;
