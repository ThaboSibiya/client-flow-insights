import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ExternalLink, CheckCircle2, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { WorkstationTask } from '@/hooks/useWorkstationData';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TasksPreviewProps {
  tasks: WorkstationTask[];
  onCompleteTask: (projectId: string, taskId: string) => void;
  onReorderTasks?: (reorderedTasks: WorkstationTask[]) => void;
  onItemClick?: () => void;
}

interface SortableTaskItemProps {
  task: WorkstationTask;
  displayPriority: string;
  isBeingDragged: boolean;
  onComplete: (e: React.MouseEvent) => void;
}

const getPriorityFromIndex = (index: number): string => {
  if (index <= 1) return 'urgent';
  if (index <= 3) return 'high';
  if (index <= 6) return 'medium';
  return 'low';
};

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500/15 text-red-600 border-red-500/30';
    case 'high':
      return 'bg-orange-500/15 text-orange-600 border-orange-500/30';
    case 'medium':
      return 'bg-yellow-500/15 text-yellow-700 border-yellow-500/30';
    case 'low':
      return 'bg-green-500/15 text-green-600 border-green-500/30';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getPriorityLabel = (priority: string) => {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

const SortableTaskItem = ({ task, displayPriority, isBeingDragged, onComplete }: SortableTaskItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityChanged = displayPriority !== task.priority;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-2 rounded-md border text-xs group bg-background transition-all",
        isDragging && "opacity-50 shadow-lg ring-2 ring-primary/20",
        priorityChanged && isBeingDragged && "ring-1 ring-primary/40"
      )}
    >
      <div className="flex items-start gap-1.5">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab active:cursor-grabbing touch-none opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{task.title}</p>
          <div className="flex items-center justify-between mt-1 gap-1">
            <span className="text-muted-foreground truncate flex-1">{task.project}</span>
            <Badge 
              variant="outline" 
              className={cn(
                "text-[10px] h-4 transition-all duration-200 shrink-0",
                getPriorityStyles(displayPriority),
                priorityChanged && "animate-pulse"
              )}
            >
              {getPriorityLabel(displayPriority)}
            </Badge>
            <Badge 
              variant="outline" 
              className={cn("text-[10px] h-4 shrink-0", {
                'bg-red-500/10 text-red-600 border-red-500/20': task.dueDate === 'Overdue',
                'bg-orange-500/10 text-orange-600 border-orange-500/20': task.dueDate === 'Today',
                'bg-yellow-500/10 text-yellow-700 border-yellow-500/20': task.dueDate === 'Tomorrow',
                'bg-muted text-muted-foreground': !['Overdue', 'Today', 'Tomorrow'].includes(task.dueDate),
              })}
            >
              {task.dueDate}
            </Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={onComplete}
          title="Mark as done"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
        </Button>
      </div>
    </div>
  );
};

const TasksPreview = ({ tasks, onCompleteTask, onReorderTasks, onItemClick }: TasksPreviewProps) => {
  const [localTasks, setLocalTasks] = React.useState(tasks);
  const [isDragging, setIsDragging] = React.useState(false);

  React.useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (_event: DragStartEvent) => {
    setIsDragging(true);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localTasks.findIndex((t) => t.id === active.id);
      const newIndex = localTasks.findIndex((t) => t.id === over.id);
      
      const reordered = arrayMove(localTasks, oldIndex, newIndex);
      setLocalTasks(reordered);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Final reorder already done in onDragOver, just persist
      onReorderTasks?.(localTasks);
    } else {
      // Persist current order even if dropped in same position
      onReorderTasks?.(localTasks);
    }
  };

  const handleDragCancel = () => {
    setIsDragging(false);
    setLocalTasks(tasks); // Reset to original
  };

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
      {localTasks.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No pending tasks</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={localTasks.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1.5">
              {localTasks.map((task, index) => (
                <SortableTaskItem
                  key={task.id}
                  task={task}
                  displayPriority={getPriorityFromIndex(index)}
                  isBeingDragged={isDragging}
                  onComplete={(e) => handleComplete(e, task)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      {localTasks.length > 0 && (
        <p className="text-[10px] text-muted-foreground/60 text-center pt-1">
          Drag to reorder priority
        </p>
      )}
    </div>
  );
};

export default TasksPreview;
