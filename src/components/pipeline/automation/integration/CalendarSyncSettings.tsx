import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Settings, RefreshCw, CheckCircle, AlertCircle, Plus, Trash2 } from 'lucide-react';
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
      email: 'team@company.com',
      name: 'Team Calendar',
      syncEnabled: true,
      lastSync: '2024-01-22T10:30:00Z'
    }
  ]);

  const calendarPlatforms = [
    { value: 'google', label: 'Google Calendar', icon: '📅' },
    { value: 'outlook', label: 'Microsoft Outlook', icon: '📧' },
    { value: 'apple', label: 'Apple Calendar', icon: '🍎' },
    { value: 'exchange', label: 'Exchange Server', icon: '🏢' }
  ];

  const testConnection = async () => {
    toast.success('Calendar connection test successful');
  };

  const triggerSync = async () => {
    toast.success('Manual calendar sync initiated');
  };

  const addCalendar = () => {
    const newCalendar = {
      id: Date.now().toString(),
      platform: 'google',
      email: '',
      name: 'New Calendar',
      syncEnabled: false,
      lastSync: null
    };
    setConnectedCalendars(prev => [...prev, newCalendar]);
  };

  const removeCalendar = (calendarId: string) => {
    setConnectedCalendars(prev => prev.filter(cal => cal.id !== calendarId));
  };

  const toggleCalendarSync = (calendarId: string) => {
    setConnectedCalendars(prev =>
      prev.map(cal =>
        cal.id === calendarId ? { ...cal, syncEnabled: !cal.syncEnabled } : cal
      )
    );
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Calendar Synchronization Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="calendar-enabled">Enable Calendar Synchronization</Label>
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

                <div className="space-y-2">
                  <Label>Default Calendar</Label>
                  <Select defaultValue="primary">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primary">Primary Calendar</SelectItem>
                      <SelectItem value="work">Work Calendar</SelectItem>
                      <SelectItem value="shared">Shared Team Calendar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={testConnection}>
                  <Settings className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
                <Button onClick={triggerSync}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Manual Sync
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {settings.enabled && (
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Connected Calendars</CardTitle>
              <Button onClick={addCalendar} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Calendar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {connectedCalendars.map((calendar) => (
                <div key={calendar.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">
                        {calendarPlatforms.find(p => p.value === calendar.platform)?.icon}
                      </span>
                      <div>
                        <h4 className="font-medium">{calendar.name}</h4>
                        <p className="text-sm text-muted-foreground">{calendar.email}</p>
                      </div>
                      <Badge variant={calendar.syncEnabled ? "default" : "secondary"}>
                        {calendar.syncEnabled ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {calendar.syncEnabled ? 'Syncing' : 'Disabled'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Platform</Label>
                        <Select value={calendar.platform}>
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
                        <Label>Email/Account</Label>
                        <Input
                          value={calendar.email}
                          placeholder="calendar@company.com"
                        />
                      </div>
                    </div>

                    {calendar.lastSync && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Last sync: {new Date(calendar.lastSync).toLocaleString()}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={calendar.syncEnabled}
                      onCheckedChange={() => toggleCalendarSync(calendar.id)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeCalendar(calendar.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CalendarSyncSettings;
