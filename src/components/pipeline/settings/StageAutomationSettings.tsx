import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare, Clock, Loader2 } from 'lucide-react';
import { useStageAutomationSettings } from '@/hooks/usePipelineSettings';

const StageAutomationSettings = () => {
  const { config, update, save, isDirty, isLoading, isSaving } = useStageAutomationSettings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5 py-2">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Stage entry notifications</Label>
          <p className="text-xs text-muted-foreground">Alert when a lead enters a stage</p>
        </div>
        <Switch checked={config.entryNotification} onCheckedChange={(v) => update('entryNotification', v)} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Stage exit notifications</Label>
          <p className="text-xs text-muted-foreground">Alert when a lead leaves a stage</p>
        </div>
        <Switch checked={config.exitNotification} onCheckedChange={(v) => update('exitNotification', v)} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Auto-create task on stage entry</Label>
          <p className="text-xs text-muted-foreground">Create a follow-up task automatically</p>
        </div>
        <Switch checked={config.autoTaskCreation} onCheckedChange={(v) => update('autoTaskCreation', v)} />
      </div>

      <div className="border-t pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-3 w-3" /> Auto follow-up
            </Label>
            <p className="text-xs text-muted-foreground">Send reminder if no activity</p>
          </div>
          <Switch checked={config.autoFollowUp} onCheckedChange={(v) => update('autoFollowUp', v)} />
        </div>

        {config.autoFollowUp && (
          <div className="grid grid-cols-2 gap-4 pl-2 border-l-2 border-amber-200">
            <div className="space-y-2">
              <Label className="text-sm">Days after inactivity</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={config.followUpDays}
                onChange={(e) => update('followUpDays', Number(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Channel</Label>
              <Select value={config.followUpChannel} onValueChange={(v) => update('followUpChannel', v as 'email' | 'sms')}>
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

      <Button onClick={save} size="sm" className="w-full" disabled={!isDirty || isSaving}>
        {isSaving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving…</> : isDirty ? 'Save Changes' : 'No Changes'}
      </Button>
    </div>
  );
};

export default StageAutomationSettings;
