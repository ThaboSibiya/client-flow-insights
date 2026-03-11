import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bell, Loader2 } from 'lucide-react';
import { useStaleLeadSettings } from '@/hooks/usePipelineSettings';

const StaleLeadSettings = () => {
  const { config, update, save, isDirty, isLoading, isSaving } = useStaleLeadSettings();

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
          <Label className="text-sm font-medium">Enable stale lead detection</Label>
          <p className="text-xs text-muted-foreground">Flag leads with no activity</p>
        </div>
        <Switch checked={config.enabled} onCheckedChange={(v) => update('enabled', v)} />
      </div>

      {config.enabled && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Days until stale</Label>
              <Input
                type="number"
                min={1}
                max={90}
                value={config.staleDays}
                onChange={(e) => update('staleDays', Number(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Action when stale</Label>
              <Select value={config.staleAction} onValueChange={(v) => update('staleAction', v as 'flag' | 'notify' | 'move')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flag">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3" /> Flag only
                    </span>
                  </SelectItem>
                  <SelectItem value="notify">
                    <span className="flex items-center gap-2">
                      <Bell className="h-3 w-3" /> Notify &amp; flag
                    </span>
                  </SelectItem>
                  <SelectItem value="move">Move to lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Notify lead owner</Label>
              <p className="text-xs text-muted-foreground">Send alert when lead goes stale</p>
            </div>
            <Switch checked={config.notifyOwner} onCheckedChange={(v) => update('notifyOwner', v)} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Auto-reassign stale leads</Label>
              <p className="text-xs text-muted-foreground">Round-robin to active team members</p>
            </div>
            <Switch checked={config.autoReassign} onCheckedChange={(v) => update('autoReassign', v)} />
          </div>
        </>
      )}

      <Button onClick={save} size="sm" className="w-full" disabled={!isDirty || isSaving}>
        {isSaving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving…</> : isDirty ? 'Save Changes' : 'No Changes'}
      </Button>
    </div>
  );
};

export default StaleLeadSettings;
