import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, Table, Loader2 } from 'lucide-react';
import { useDisplaySettings } from '@/hooks/usePipelineSettings';

const PipelineDisplaySettings = () => {
  const { config, update, save, isDirty, isLoading, isSaving } = useDisplaySettings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5 py-2">
      <div className="space-y-2">
        <Label className="text-sm">Default view</Label>
        <Select value={config.defaultView} onValueChange={(v) => update('defaultView', v as 'kanban' | 'list' | 'table')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="kanban">
              <span className="flex items-center gap-2">
                <LayoutGrid className="h-3 w-3" /> Kanban Board
              </span>
            </SelectItem>
            <SelectItem value="list">
              <span className="flex items-center gap-2">
                <List className="h-3 w-3" /> List View
              </span>
            </SelectItem>
            <SelectItem value="table">
              <span className="flex items-center gap-2">
                <Table className="h-3 w-3" /> Table View
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Card fields</Label>

        <div className="flex items-center justify-between">
          <Label className="text-sm text-muted-foreground">Show lead source</Label>
          <Switch checked={config.showCardSource} onCheckedChange={(v) => update('showCardSource', v)} />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-sm text-muted-foreground">Show deal value</Label>
          <Switch checked={config.showCardValue} onCheckedChange={(v) => update('showCardValue', v)} />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-sm text-muted-foreground">Show stage count badges</Label>
          <Switch checked={config.showStageCount} onCheckedChange={(v) => update('showStageCount', v)} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Show stage metrics</Label>
          <p className="text-xs text-muted-foreground">Conversion rates and targets</p>
        </div>
        <Switch checked={config.showMetrics} onCheckedChange={(v) => update('showMetrics', v)} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Compact card mode</Label>
          <p className="text-xs text-muted-foreground">Show less detail per card</p>
        </div>
        <Switch checked={config.compactCards} onCheckedChange={(v) => update('compactCards', v)} />
      </div>

      <Button onClick={save} size="sm" className="w-full" disabled={!isDirty || isSaving}>
        {isSaving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving…</> : isDirty ? 'Save Changes' : 'No Changes'}
      </Button>
    </div>
  );
};

export default PipelineDisplaySettings;
