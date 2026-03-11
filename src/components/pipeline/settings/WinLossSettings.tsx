import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, X, Plus, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const DEFAULT_LOSS_REASONS = [
  'Price too high',
  'Chose competitor',
  'No budget',
  'Timing not right',
  'No response',
  'Not a fit',
];

const WinLossSettings = () => {
  const [lossReasons, setLossReasons] = useState<string[]>(DEFAULT_LOSS_REASONS);
  const [newReason, setNewReason] = useState('');
  const [requireLossReason, setRequireLossReason] = useState(true);
  const [trackRevenue, setTrackRevenue] = useState(true);
  const [showWinProbability, setShowWinProbability] = useState(false);

  const addReason = () => {
    const trimmed = newReason.trim();
    if (trimmed && !lossReasons.includes(trimmed)) {
      setLossReasons(prev => [...prev, trimmed]);
      setNewReason('');
    }
  };

  const removeReason = (reason: string) => {
    setLossReasons(prev => prev.filter(r => r !== reason));
  };

  const handleSave = () => {
    toast.success('Win/loss tracking settings saved');
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-emerald-500" />
          Win/Loss Tracking
        </CardTitle>
        <CardDescription>
          Track deal outcomes and reasons for lost opportunities.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Require loss reason</Label>
            <p className="text-xs text-muted-foreground">Prompt for reason when marking lost</p>
          </div>
          <Switch checked={requireLossReason} onCheckedChange={setRequireLossReason} />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Track deal revenue</Label>
            <p className="text-xs text-muted-foreground">Show estimated value on pipeline cards</p>
          </div>
          <Switch checked={trackRevenue} onCheckedChange={setTrackRevenue} />
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
          <Switch checked={showWinProbability} onCheckedChange={setShowWinProbability} />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Loss reason categories</Label>
          <div className="flex flex-wrap gap-2">
            {lossReasons.map((reason) => (
              <Badge
                key={reason}
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
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

        <Button onClick={handleSave} size="sm" className="w-full">
          Save Win/Loss Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default WinLossSettings;
