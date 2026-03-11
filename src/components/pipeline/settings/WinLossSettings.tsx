import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus, TrendingUp, Loader2 } from 'lucide-react';
import { useWinLossSettings } from '@/hooks/usePipelineSettings';

const WinLossSettings = () => {
  const { config, update, save, isDirty, isLoading, isSaving } = useWinLossSettings();
  const [newReason, setNewReason] = useState('');

  const addReason = () => {
    const trimmed = newReason.trim();
    if (trimmed && !config.lossReasons.includes(trimmed)) {
      update('lossReasons', [...config.lossReasons, trimmed]);
      setNewReason('');
    }
  };

  const removeReason = (reason: string) => {
    update('lossReasons', config.lossReasons.filter((r) => r !== reason));
  };

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
          <Label className="text-sm font-medium">Require loss reason</Label>
          <p className="text-xs text-muted-foreground">Prompt for reason when marking lost</p>
        </div>
        <Switch checked={config.requireLossReason} onCheckedChange={(v) => update('requireLossReason', v)} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Track deal revenue</Label>
          <p className="text-xs text-muted-foreground">Show estimated value on pipeline cards</p>
        </div>
        <Switch checked={config.trackRevenue} onCheckedChange={(v) => update('trackRevenue', v)} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Win probability per stage</Label>
          <p className="text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> Show forecasting percentages
            </span>
          </p>
        </div>
        <Switch checked={config.showWinProbability} onCheckedChange={(v) => update('showWinProbability', v)} />
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Loss reason categories</Label>
        <div className="flex flex-wrap gap-2">
          {config.lossReasons.map((reason) => (
            <Badge key={reason} variant="secondary" className="flex items-center gap-1 pr-1">
              {reason}
              <button
                onClick={() => removeReason(reason)}
                className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            placeholder="Add custom reason..."
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && addReason()}
          />
          <Button variant="outline" size="sm" onClick={addReason}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button onClick={save} size="sm" className="w-full" disabled={!isDirty || isSaving}>
        {isSaving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving…</> : isDirty ? 'Save Changes' : 'No Changes'}
      </Button>
    </div>
  );
};

export default WinLossSettings;
