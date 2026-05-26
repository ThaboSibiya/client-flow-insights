import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Clock, Trash2, Plus, Sparkles } from 'lucide-react';
import { useScheduledPrompts, ScheduledFrequency } from '../useScheduledPrompts';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const friendlyFrequency = (p: { frequency: ScheduledFrequency; time_of_day: string; day_of_week: number | null; day_of_month: number | null }) => {
  const time = p.time_of_day.slice(0, 5);
  switch (p.frequency) {
    case 'daily': return `Every day at ${time}`;
    case 'weekdays': return `Weekdays at ${time}`;
    case 'weekly': return `Every ${WEEKDAY_LABELS[p.day_of_week ?? 1]} at ${time}`;
    case 'monthly': return `Day ${p.day_of_month ?? 1} of every month at ${time}`;
  }
};

const safeDate = (iso: string | null) => {
  if (!iso) return null;
  try { return format(new Date(iso), 'd MMM, HH:mm'); } catch { return null; }
};

const ScheduledPromptsSheet: React.FC<Props> = ({ open, onOpenChange }) => {
  const { prompts, isLoading, create, toggle, remove, isCreating } = useScheduledPrompts();
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [frequency, setFrequency] = useState<ScheduledFrequency>('weekly');
  const [time, setTime] = useState('08:00');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [dayOfMonth, setDayOfMonth] = useState(1);

  const resetForm = () => {
    setName(''); setPrompt(''); setFrequency('weekly');
    setTime('08:00'); setDayOfWeek(1); setDayOfMonth(1);
    setShowForm(false);
  };

  const handleCreate = async () => {
    if (!name.trim() || !prompt.trim()) return;
    await create({
      name, prompt, frequency,
      time_of_day: time,
      day_of_week: frequency === 'weekly' ? dayOfWeek : null,
      day_of_month: frequency === 'monthly' ? dayOfMonth : null,
    });
    resetForm();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-5 pt-5 pb-3 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Scheduled prompts
          </SheetTitle>
          <SheetDescription className="text-xs">
            Ask Quikle to run a prompt on a schedule. Results land in your notifications.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 [&::-webkit-scrollbar]:hidden">
          {!showForm && (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4" /> New scheduled prompt
            </Button>
          )}

          {showForm && (
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="sp-name" className="text-xs">Name</Label>
                <Input
                  id="sp-name"
                  placeholder="Weekly pipeline summary"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={80}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sp-prompt" className="text-xs">Prompt</Label>
                <Textarea
                  id="sp-prompt"
                  placeholder="Summarize my pipeline, flag overdue invoices, and suggest 3 follow-ups."
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  rows={3}
                  maxLength={500}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">When</Label>
                  <Select value={frequency} onValueChange={(v: ScheduledFrequency) => setFrequency(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Every day</SelectItem>
                      <SelectItem value="weekdays">Weekdays</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sp-time" className="text-xs">Time</Label>
                  <Input id="sp-time" type="time" value={time} onChange={e => setTime(e.target.value)} />
                </div>
              </div>

              {frequency === 'weekly' && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Day of week</Label>
                  <Select value={String(dayOfWeek)} onValueChange={v => setDayOfWeek(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {WEEKDAY_LABELS.map((d, i) => (
                        <SelectItem key={i} value={String(i)}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {frequency === 'monthly' && (
                <div className="space-y-1.5">
                  <Label htmlFor="sp-dom" className="text-xs">Day of month (1–28)</Label>
                  <Input
                    id="sp-dom"
                    type="number"
                    min={1}
                    max={28}
                    value={dayOfMonth}
                    onChange={e => setDayOfMonth(Math.max(1, Math.min(28, Number(e.target.value) || 1)))}
                  />
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  onClick={handleCreate}
                  disabled={isCreating || !name.trim() || !prompt.trim()}
                  className="flex-1"
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                  {isCreating ? 'Saving…' : 'Schedule'}
                </Button>
                <Button size="sm" variant="ghost" onClick={resetForm}>Cancel</Button>
              </div>
            </div>
          )}

          {isLoading && (
            <p className="text-xs text-muted-foreground text-center py-4">Loading…</p>
          )}

          {!isLoading && prompts.length === 0 && !showForm && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No scheduled prompts yet</p>
              <p className="text-xs mt-1">e.g. "Every Monday 8am, summarize my pipeline"</p>
            </div>
          )}

          {prompts.map(p => (
            <div
              key={p.id}
              className={cn(
                'rounded-lg border border-border bg-card p-3 space-y-2',
                !p.is_active && 'opacity-60'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">{friendlyFrequency(p)}</p>
                </div>
                <Switch
                  checked={p.is_active}
                  onCheckedChange={(v) => toggle({ id: p.id, is_active: v })}
                />
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{p.prompt}</p>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>
                  {p.last_run_at
                    ? `Last run ${safeDate(p.last_run_at)}`
                    : `Next run ${safeDate(p.next_run_at)}`}
                </span>
                <button
                  onClick={() => remove(p.id)}
                  className="inline-flex items-center gap-1 hover:text-destructive transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ScheduledPromptsSheet;
