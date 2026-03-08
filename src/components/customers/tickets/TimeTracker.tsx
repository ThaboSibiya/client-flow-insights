import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Clock, Plus } from 'lucide-react';
import { TimeEntry } from '@/types/customer';
import { formatDuration, formatTicketDate } from '@/utils/ticketFormatters';

interface TimeTrackerProps {
  timeEntries: TimeEntry[];
  totalTimeSpent: number;
  onAddTimeEntry: (timeEntry: Omit<TimeEntry, 'id' | 'ticketId' | 'createdAt'>) => void;
}

const TimeTracker = ({ timeEntries, totalTimeSpent, onAddTimeEntry }: TimeTrackerProps) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentStartTime, setCurrentStartTime] = useState<Date | null>(null);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [trackingDescription, setTrackingDescription] = useState('');
  const [manualDuration, setManualDuration] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startTracking = useCallback(() => {
    const now = new Date();
    setCurrentStartTime(now);
    setIsTracking(true);
    setCurrentDuration(0);

    intervalRef.current = setInterval(() => {
      setCurrentDuration(Math.floor((Date.now() - now.getTime()) / 60000));
    }, 60000);
  }, []);

  const stopTracking = useCallback(() => {
    if (currentStartTime && isTracking) {
      const endTime = new Date();
      const duration = Math.max(1, Math.floor((endTime.getTime() - currentStartTime.getTime()) / 60000));

      onAddTimeEntry({
        userId: 'current-user',
        userName: 'Current User',
        description: trackingDescription || 'Time tracked',
        duration,
        startTime: currentStartTime,
        endTime,
      });

      setIsTracking(false);
      setCurrentStartTime(null);
      setCurrentDuration(0);
      setTrackingDescription('');

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [currentStartTime, isTracking, trackingDescription, onAddTimeEntry]);

  const addManualEntry = useCallback(() => {
    const duration = parseInt(manualDuration);
    if (duration > 0 && manualDescription.trim()) {
      const now = new Date();
      const startTime = new Date(now.getTime() - duration * 60000);

      onAddTimeEntry({
        userId: 'current-user',
        userName: 'Current User',
        description: manualDescription,
        duration,
        startTime,
        endTime: now,
      });

      setManualDuration('');
      setManualDescription('');
      setIsManualEntryOpen(false);
    }
  }, [manualDuration, manualDescription, onAddTimeEntry]);

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Total</span>
          <Badge variant="outline" className="text-xs">{formatDuration(totalTimeSpent)}</Badge>
        </div>

        <div className="flex gap-1.5">
          {!isTracking ? (
            <Button size="sm" onClick={startTracking} variant="default" className="h-7 text-xs">
              <Play className="h-3 w-3 mr-1" />
              Start
            </Button>
          ) : (
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mr-1.5 inline-block" />
                {formatDuration(currentDuration)}
              </Badge>
              <Button size="sm" onClick={stopTracking} variant="outline" className="h-7 text-xs">
                <Pause className="h-3 w-3 mr-1" />
                Stop
              </Button>
            </div>
          )}

          <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-7 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Manual
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[380px]">
              <DialogHeader>
                <DialogTitle>Add Time Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Duration (minutes)</label>
                  <Input
                    type="number"
                    value={manualDuration}
                    onChange={(e) => setManualDuration(e.target.value)}
                    placeholder="60"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                  <Textarea
                    value={manualDescription}
                    onChange={(e) => setManualDescription(e.target.value)}
                    placeholder="What did you work on?"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setIsManualEntryOpen(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={addManualEntry} disabled={!manualDuration || !manualDescription.trim()}>
                    Add Entry
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Active tracking input */}
      {isTracking && (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-md p-2.5">
          <Input
            value={trackingDescription}
            onChange={(e) => setTrackingDescription(e.target.value)}
            placeholder="What are you working on?"
            className="text-sm h-8"
          />
        </div>
      )}

      {/* Entries list */}
      {timeEntries.length > 0 && (
        <div className="space-y-1.5 max-h-32 overflow-y-auto">
          {timeEntries.map((entry) => (
            <div key={entry.id} className="text-xs bg-muted/50 p-2 rounded-md flex justify-between items-start">
              <div className="min-w-0">
                <span className="font-medium text-foreground">{entry.description}</span>
                <div className="text-muted-foreground mt-0.5">
                  {entry.userName} · {formatTicketDate(entry.startTime)}
                </div>
              </div>
              <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                {formatDuration(entry.duration)}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimeTracker;
