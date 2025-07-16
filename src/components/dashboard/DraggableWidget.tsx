
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DraggableWidgetProps {
  id: string;
  isEditMode: boolean;
  children: React.ReactNode;
}

const DraggableWidget: React.FC<DraggableWidgetProps> = ({ id, isEditMode, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isEditMode ? { ...attributes, ...listeners } : {})}
      className={`${isEditMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      {children}
    </div>
  );
};

export default DraggableWidget;
