import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ExternalLink, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { WorkstationTask } from '@/hooks/useWorkstationData';

interface TasksPreviewProps {
  tasks: WorkstationTask[];
  onCompleteTask: (projectId: string, taskId: string) => void;
  onItemClick?: () => void;
}

const TasksPreview = ({ tasks, onCompleteTask, onItemClick }: TasksPreviewProps) => {
  const handleComplete = (e: React.MouseEvent, task: WorkstationTask) => {
    e.preventDefault();
    e.stopPropagation();
    onCompleteTask(task.projectId, task.id);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase">Pending Tasks</span>
        <Link to="/projects" className="text-xs text-primary hover:underline flex items-center gap-1" onClick={onItemClick}>
          View all <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
      {tasks.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No pending tasks</p>
      ) : (
        tasks.map((t) => (
          <div key={t.id} className="p-2 rounded-md border text-xs group">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{t.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-muted-foreground truncate">{t.project}</span>
                  <Badge 
                    variant="outline" 
                    className={cn("text-[10px] h-4", {
                      'bg-red-500/10 text-red-600 border-red-500/20': t.priority === 'urgent' || t.priority === 'high',
                      'bg-orange-500/10 text-orange-600 border-orange-500/20': t.priority === 'medium',
                      'bg-green-500/10 text-green-600 border-green-500/20': t.priority === 'low',
                    })}
                  >
                    {t.dueDate}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                onClick={(e) => handleComplete(e, t)}
                title="Mark as done"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TasksPreview;
