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
  onComplete: (e: React.MouseEvent) => void;
}

const SortableTaskItem = ({ task, onComplete }: SortableTaskItemProps) => {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-2 rounded-md border text-xs group bg-background",
        isDragging && "opacity-50 shadow-lg ring-2 ring-primary/20"
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
          <div className="flex items-center justify-between mt-1">
            <span className="text-muted-foreground truncate">{task.project}</span>
            <Badge 
              variant="outline" 
              className={cn("text-[10px] h-4", {
                'bg-red-500/10 text-red-600 border-red-500/20': task.priority === 'urgent' || task.priority === 'high',
                'bg-orange-500/10 text-orange-600 border-orange-500/20': task.priority === 'medium',
                'bg-green-500/10 text-green-600 border-green-500/20': task.priority === 'low',
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = localTasks.findIndex((t) => t.id === active.id);
      const newIndex = localTasks.findIndex((t) => t.id === over.id);
      
      const reordered = arrayMove(localTasks, oldIndex, newIndex);
      setLocalTasks(reordered);
      onReorderTasks?.(reordered);
    }
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
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localTasks.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1.5">
              {localTasks.map((task) => (
                <SortableTaskItem
                  key={task.id}
                  task={task}
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
