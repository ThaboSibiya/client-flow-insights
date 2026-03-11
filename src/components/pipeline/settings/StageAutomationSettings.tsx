import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Zap, Mail, MessageSquare, Clock } from 'lucide-react';
import { toast } from 'sonner';

const StageAutomationSettings = () => {
  const [autoFollowUp, setAutoFollowUp] = useState(false);
  const [followUpDays, setFollowUpDays] = useState('3');
  const [followUpChannel, setFollowUpChannel] = useState('email');
  const [entryNotification, setEntryNotification] = useState(true);
  const [exitNotification, setExitNotification] = useState(false);
  const [autoTaskCreation, setAutoTaskCreation] = useState(false);

  const handleSave = () => {
    toast.success('Stage automation settings saved');
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="h-4 w-4 text-amber-500" />
          Stage Automations
        </CardTitle>
        <CardDescription>
          Trigger automatic actions when leads move between stages.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Stage entry notifications</Label>
            <p className="text-xs text-muted-foreground">Alert when a lead enters a stage</p>
          </div>
          <Switch checked={entryNotification} onCheckedChange={setEntryNotification} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Stage exit notifications</Label>
            <p className="text-xs text-muted-foreground">Alert when a lead leaves a stage</p>
          </div>
          <Switch checked={exitNotification} onCheckedChange={setExitNotification} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Auto-create task on stage entry</Label>
            <p className="text-xs text-muted-foreground">Create a follow-up task automatically</p>
          </div>
          <Switch checked={autoTaskCreation} onCheckedChange={setAutoTaskCreation} />
        </div>

        <div className="border-t pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-3 w-3" /> Auto follow-up
              </Label>
              <p className="text-xs text-muted-foreground">Send reminder if no activity</p>
            </div>
            <Switch checked={autoFollowUp} onCheckedChange={setAutoFollowUp} />
          </div>

          {autoFollowUp && (
            <div className="grid grid-cols-2 gap-4 pl-2 border-l-2 border-amber-200">
              <div className="space-y-2">
                <Label className="text-sm">Days after inactivity</Label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={followUpDays}
                  onChange={(e) => setFollowUpDays(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Channel</Label>
                <Select value={followUpChannel} onValueChange={setFollowUpChannel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">
                      <span className="flex items-center gap-2">
                        <Mail className="h-3 w-3" /> Email
                      </span>
                    </SelectItem>
                    <SelectItem value="sms">
                      <span className="flex items-center gap-2">
                        <MessageSquare className="h-3 w-3" /> SMS
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <Button onClick={handleSave} size="sm" className="w-full">
          Save Automation Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default StageAutomationSettings;
