import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ImportDataType, FieldMapping, ParsedRow, CRM_FIELDS } from './types';

interface FieldMapperProps {
  dataType: ImportDataType;
  fileName: string;
  rowCount: number;
  fieldMappings: FieldMapping[];
  headerCount: number;
  sampleRow: ParsedRow | undefined;
  missingRequired: string[];
  onUpdateMapping: (csvColumn: string, crmField: string) => void;
  onReorderMappings: (mappings: FieldMapping[]) => void;
  onBack: () => void;
  onContinue: () => void;
}

interface SortableRowProps {
  mapping: FieldMapping;
  dataType: ImportDataType;
  sampleRow: ParsedRow | undefined;
  onUpdateMapping: (csvColumn: string, crmField: string) => void;
}

const SortableRow = ({ mapping, dataType, sampleRow, onUpdateMapping }: SortableRowProps) => {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: mapping.csvColumn });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  const isSkipped = mapping.crmField === '_skip';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2.5 rounded-lg transition-colors ${
        isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''
      } ${isSkipped ? 'bg-muted/30' : 'bg-muted/60'}`}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0 touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-mono truncate block text-foreground">{mapping.csvColumn}</span>
        <span className="text-xs text-muted-foreground truncate block">
          {sampleRow?.[mapping.csvColumn]?.slice(0, 50) || '—'}
        </span>
      </div>
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <Select value={mapping.crmField} onValueChange={(v) => onUpdateMapping(mapping.csvColumn, v)}>
        <SelectTrigger className={`w-44 text-xs ${isSkipped ? 'text-muted-foreground' : ''}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_skip">⏭ Skip</SelectItem>
          {CRM_FIELDS[dataType].map(f => (
            <SelectItem key={f.field} value={f.field}>
              {f.label} {f.required && <span className="text-destructive">*</span>}
            </SelectItem>
          ))}
          {dataType === 'customers' && <SelectItem value="_merge_name">↪ Merge into Name</SelectItem>}
        </SelectContent>
      </Select>
    </div>
  );
};

const FieldMapper = ({
  dataType, fileName, rowCount, fieldMappings, headerCount,
  sampleRow, missingRequired, onUpdateMapping, onReorderMappings, onBack, onContinue,
}: FieldMapperProps) => {
  const mappedCount = fieldMappings.filter(m => m.crmField !== '_skip').length;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = fieldMappings.findIndex(m => m.csvColumn === active.id);
    const newIndex = fieldMappings.findIndex(m => m.csvColumn === over.id);
    onReorderMappings(arrayMove(fieldMappings, oldIndex, newIndex));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-foreground">Map Your Columns</h3>
          <p className="text-xs text-muted-foreground">
            {fileName} • {rowCount} rows • {mappedCount}/{headerCount} mapped
          </p>
        </div>
        {missingRequired.length > 0 && (
          <Badge variant="destructive" className="text-xs">
            {missingRequired.length} required unmapped
          </Badge>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fieldMappings.map(m => m.csvColumn)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
            {fieldMappings.map(mapping => (
              <SortableRow
                key={mapping.csvColumn}
                mapping={mapping}
                dataType={dataType}
                sampleRow={sampleRow}
                onUpdateMapping={onUpdateMapping}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex justify-between pt-1">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button size="sm" onClick={onContinue} disabled={missingRequired.length > 0}>
          Transformations <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default FieldMapper;
