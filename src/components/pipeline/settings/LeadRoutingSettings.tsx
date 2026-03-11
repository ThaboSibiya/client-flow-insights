import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Users, Shuffle, UserPlus, Loader2 } from 'lucide-react';
import { useLeadRoutingSettings } from '@/hooks/usePipelineSettings';

const LeadRoutingSettings = () => {
  const { config, update, save, isDirty, isLoading, isSaving } = useLeadRoutingSettings();

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
          <Label className="text-sm font-medium">Auto-assign new leads</Label>
          <p className="text-xs text-muted-foreground">Automatically route leads to employees</p>
        </div>
        <Switch checked={config.autoAssign} onCheckedChange={(v) => update('autoAssign', v)} />
      </div>

      {config.autoAssign && (
        <>
          <div className="space-y-2">
            <Label className="text-sm">Routing method</Label>
            <Select value={config.routingMethod} onValueChange={(v) => update('routingMethod', v as 'round-robin' | 'load-balanced' | 'manual')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="round-robin">
                  <span className="flex items-center gap-2">
                    <Shuffle className="h-3 w-3" /> Round Robin
                  </span>
                </SelectItem>
                <SelectItem value="load-balanced">
                  <span className="flex items-center gap-2">
                    <Users className="h-3 w-3" /> Load Balanced
                  </span>
                </SelectItem>
                <SelectItem value="manual">
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-3 w-3" /> Manual Only
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Max leads per employee</Label>
            <Input
              type="number"
              min={1}
              max={500}
              value={config.maxLeadsPerEmployee}
              onChange={(e) => update('maxLeadsPerEmployee', Number(e.target.value) || 1)}
            />
            <p className="text-xs text-muted-foreground">New leads skip employees at capacity</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Route by lead source</Label>
              <p className="text-xs text-muted-foreground">Assign Voice AI leads to specific reps</p>
            </div>
            <Switch checked={config.assignBySource} onCheckedChange={(v) => update('assignBySource', v)} />
          </div>
        </>
      )}

      <Button onClick={save} size="sm" className="w-full" disabled={!isDirty || isSaving}>
        {isSaving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving…</> : isDirty ? 'Save Changes' : 'No Changes'}
      </Button>
    </div>
  );
};

export default LeadRoutingSettings;
