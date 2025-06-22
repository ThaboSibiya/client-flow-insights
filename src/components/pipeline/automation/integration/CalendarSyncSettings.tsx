
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Settings, Sync, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface CalendarSyncSettingsProps {
  settings: any;
  onUpdateSettings: (updates: any) => void;
}

const CalendarSyncSettings = ({ settings, onUpdateSettings }: CalendarSyncSettingsProps) => {
  const [connectedCalendars, setConnectedCalendars] = useState([
    {
      id: '1',
      platform: 'google',
      email: 'john@company.com',
      name: 'John Doe',
      enabled: true,
      permissions: ['read', 'write']
    },
    {
      id: '2',
      platform: 'outlook',
      email: 'jane@company.com',
      name: 'Jane Smith',
      enabled: true,
      permissions: ['read']
    }
  ]);

  const [syncRules, setSyncRules] = useState([
    {
      id: '1',
      name: 'Appointment Scheduling',
      enabled: true,
      trigger: 'appointment_booked',
      action: 'create_calendar_event',
      attendees: ['assigned_employee', 'customer']
    },
    {
      id: '2',
      name: 'Team Availability',
      enabled: true,
      trigger: 'schedule_check',
      action: 'check_availability',
      lookAhead: 14
    }
  ]);

  const calendarPlatforms = [
    { value: 'google', label: 'Google Calendar', icon: '📅' },
    { value: 'outlook', label: 'Microsoft Outlook', icon: '📆' },
    { value: 'apple', label: 'Apple Calendar', icon: '🍎' },
    { value: 'caldav', label: 'CalDAV', icon: '🔗' }
  ];

  const connectCalendar = async (platform: string) => {
    toast.success(`${platform} calendar connection initiated`);
  };

  const syncCalendars = async () => {
    toast.success('Calendar sync completed');
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Calendar Integration Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="calendar-enabled">Enable Calendar Sync</Label>
            <Switch
              id="calendar-enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => onUpdateSettings({ enabled: checked })}
            />
          </div>

          {settings.enabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Calendar Platform</Label>
                  <Select defaultValue="google">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {calendarPlatforms.map((platform) => (
                        <SelectItem key={platform.value} value={platform.value}>
                          <span className="flex items-center gap-2">
                            <span>{platform.icon}</span>
                            {platform.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sync Frequency</Label>
                  <Select defaultValue="realtime">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="5min">Every 5 minutes</SelectItem>
                      <SelectItem value="15min">Every 15 minutes</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={syncCalendars}>
                  <Sync className="h-4 w-4 mr-2" />
                  Sync All Calendars
                </Button>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Sync Settings
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {settings.enabled && (
        <>
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Connected Calendars
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connectedCalendars.map((calendar) => (
                  <div key={calendar.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {calendar.platform === 'google' && '📅'}
                        {calendar.platform === 'outlook' && '📆'}
                        {calendar.platform === 'apple' && '🍎'}
                      </div>
                      <div>
                        <h4 className="font-medium">{calendar.name}</h4>
                        <p className="text-sm text-muted-foreground">{calendar.email}</p>
                        <div className="flex gap-1 mt-1">
                          {calendar.permissions.map((perm) => (
                            <Badge key={perm} variant="outline" className="text-xs">
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={calendar.enabled ? "default" : "secondary"}>
                        {calendar.enabled ? 'Connected' : 'Disconnected'}
                      </Badge>
                      <Switch
                        checked={calendar.enabled}
                        onCheckedChange={() => {
                          setConnecte dCalendars(prev =>
                            prev.map(cal =>
                              cal.id === calendar.id ? { ...cal, enabled: !cal.enabled } : cal
                            )
                          );
                        }}
                      />
                    </div>
                  </div>
                ))}

                <div className="flex gap-2">
                  {calendarPlatforms.map((platform) => (
                    <Button
                      key={platform.value}
                      variant="outline"
                      onClick={() => connectCalendar(platform.label)}
                      className="flex-1"
                    >
                      <span className="mr-2">{platform.icon}</span>
                      Connect {platform.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Sync Rules & Automation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {syncRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{rule.name}</h4>
                        <Badge variant={rule.enabled ? "default" : "secondary"}>
                          {rule.enabled ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <div>Trigger: <span className="font-medium">{rule.trigger}</span></div>
                        <div>Action: <span className="font-medium">{rule.action}</span></div>
                        {rule.attendees && (
                          <div>Attendees: <span className="font-medium">{rule.attendees.join(', ')}</span></div>
                        )}
                      </div>
                    </div>
                    
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={() => {
                        setSyncRules(prev =>
                          prev.map(r =>
                            r.id === rule.id ? { ...r, enabled: !r.enabled } : r
                          )
                        );
                      }}
                    />
                  </div>
                ))}

                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Add Custom Sync Rule
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default CalendarSyncSettings;
