
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  GripVertical, 
  Trash2, 
  Type, 
  Mail, 
  Phone, 
  Hash, 
  Calendar, 
  ChevronDown, 
  FileText, 
  CheckSquare 
} from "lucide-react";
import { BuilderField } from './TemplateBuilder';
import FieldOptionsEditor from './FieldOptionsEditor';

const fieldIcons = {
  text: Type,
  email: Mail,
  phone: Phone,
  number: Hash,
  date: Calendar,
  select: ChevronDown,
  textarea: FileText,
  checkbox: CheckSquare,
};

interface TemplateFieldsListProps {
  fields: BuilderField[];
  onUpdateField: (tempId: string, updates: Partial<BuilderField>) => void;
  onRemoveField: (tempId: string) => void;
}

interface SortableFieldItemProps {
  field: BuilderField;
  onUpdateField: (tempId: string, updates: Partial<BuilderField>) => void;
  onRemoveField: (tempId: string) => void;
}

const SortableFieldItem = ({ field, onUpdateField, onRemoveField }: SortableFieldItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.tempId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const IconComponent = fieldIcons[field.field_type as keyof typeof fieldIcons] || Type;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-4 ${isDragging ? 'opacity-50' : ''} hover:shadow-md transition-shadow`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
          
          <div className="flex items-center gap-2">
            <IconComponent className="w-4 h-4 text-quikle-primary" />
            <Badge variant="outline" className="text-xs">
              {field.field_type}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-2">
              <Label htmlFor={`required-${field.tempId}`} className="text-xs">
                Required
              </Label>
              <Switch
                id={`required-${field.tempId}`}
                checked={field.is_required}
                onCheckedChange={(checked) => 
                  onUpdateField(field.tempId, { is_required: checked })
                }
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveField(field.tempId)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Field Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`name-${field.tempId}`} className="text-sm">
              Field Name
            </Label>
            <Input
              id={`name-${field.tempId}`}
              value={field.field_name}
              onChange={(e) => 
                onUpdateField(field.tempId, { field_name: e.target.value })
              }
              placeholder="field_name"
              className="text-sm"
            />
          </div>
          
          <div>
            <Label htmlFor={`label-${field.tempId}`} className="text-sm">
              Display Label
            </Label>
            <Input
              id={`label-${field.tempId}`}
              value={field.field_label}
              onChange={(e) => 
                onUpdateField(field.tempId, { field_label: e.target.value })
              }
              placeholder="Field Label"
              className="text-sm"
            />
          </div>
        </div>

        {/* Field Options */}
        <FieldOptionsEditor
          field={field}
          onUpdateField={onUpdateField}
        />
      </div>
    </Card>
  );
};

const TemplateFieldsList = ({ fields, onUpdateField, onRemoveField }: TemplateFieldsListProps) => {
  if (fields.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">No fields yet</p>
        <p className="text-sm">Drag field types from the palette to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <SortableFieldItem
          key={field.tempId}
          field={field}
          onUpdateField={onUpdateField}
          onRemoveField={onRemoveField}
        />
      ))}
    </div>
  );
};

export default TemplateFieldsList;
