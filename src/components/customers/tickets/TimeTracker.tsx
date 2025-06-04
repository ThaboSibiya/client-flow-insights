
import React, { useState } from 'react';
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

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const startTracking = () => {
    const now = new Date();
    setCurrentStartTime(now);
    setIsTracking(true);
    setCurrentDuration(0);
    
    // Update duration every minute
    const interval = setInterval(() => {
      if (currentStartTime) {
        const elapsed = Math.floor((new Date().getTime() - currentStartTime.getTime()) / 60000);
        setCurrentDuration(elapsed);
      }
    }, 60000);

    // Store interval ID for cleanup
    (window as any).timeTrackingInterval = interval;
  };

  const stopTracking = () => {
    if (currentStartTime && isTracking) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - currentStartTime.getTime()) / 60000);
      
      onAddTimeEntry({
        userId: 'current-user', // This would come from auth context
        userName: 'Current User', // This would come from auth context
        description: trackingDescription || 'Time tracked',
        duration: duration || 1, // Minimum 1 minute
        startTime: currentStartTime,
        endTime,
      });

      setIsTracking(false);
      setCurrentStartTime(null);
      setCurrentDuration(0);
      setTrackingDescription('');
      
      // Clear interval
      if ((window as any).timeTrackingInterval) {
        clearInterval((window as any).timeTrackingInterval);
      }
    }
  };

  const addManualEntry = () => {
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
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span className="font-medium">Time Tracking</span>
          <Badge variant="outline">{formatTime(totalTimeSpent)}</Badge>
        </div>
        
        <div className="flex gap-2">
          {!isTracking ? (
            <Button size="sm" onClick={startTracking} className="bg-green-600 hover:bg-green-700">
              <Play className="h-3 w-3 mr-1" />
              Start
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {formatTime(currentDuration)} tracking...
              </Badge>
              <Button size="sm" onClick={stopTracking} variant="outline">
                <Pause className="h-3 w-3 mr-1" />
                Stop
              </Button>
            </div>
          )}
          
          <Dialog open={isManualEntryOpen} onOpenChange={setIsManualEntryOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-3 w-3 mr-1" />
                Add Time
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Manual Time Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                  <Input
                    type="number"
                    value={manualDuration}
                    onChange={(e) => setManualDuration(e.target.value)}
                    placeholder="60"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Textarea
                    value={manualDescription}
                    onChange={(e) => setManualDescription(e.target.value)}
                    placeholder="What did you work on?"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addManualEntry} disabled={!manualDuration || !manualDescription.trim()}>
                    Add Entry
                  </Button>
                  <Button variant="outline" onClick={() => setIsManualEntryOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isTracking && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-800">Currently tracking time</span>
          </div>
          <Input
            value={trackingDescription}
            onChange={(e) => setTrackingDescription(e.target.value)}
            placeholder="What are you working on?"
            className="text-sm"
          />
        </div>
      )}

      {timeEntries.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Time Entries</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {timeEntries.map((entry) => (
              <div key={entry.id} className="text-xs bg-gray-50 p-2 rounded">
                <div className="flex justify-between items-start">
                  <span className="font-medium">{entry.description}</span>
                  <Badge variant="outline" className="text-xs">
                    {formatTime(entry.duration)}
                  </Badge>
                </div>
                <div className="text-gray-500 mt-1">
                  {entry.userName} • {entry.startTime.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeTracker;
