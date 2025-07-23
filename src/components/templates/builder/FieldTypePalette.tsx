
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDraggable } from '@dnd-kit/core';
import { 
  Type, 
  Mail, 
  Phone, 
  Hash, 
  Calendar, 
  ChevronDown, 
  FileText, 
  CheckSquare,
  Grip
} from "lucide-react";

const fieldTypes = [
  { type: 'text', label: 'Text', icon: Type, description: 'Single line text input' },
  { type: 'email', label: 'Email', icon: Mail, description: 'Email address input' },
  { type: 'phone', label: 'Phone', icon: Phone, description: 'Phone number input' },
  { type: 'number', label: 'Number', icon: Hash, description: 'Numeric input' },
  { type: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
  { type: 'select', label: 'Dropdown', icon: ChevronDown, description: 'Select from options' },
  { type: 'textarea', label: 'Text Area', icon: FileText, description: 'Multi-line text input' },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, description: 'True/false toggle' },
];

interface DraggableFieldTypeProps {
  fieldType: typeof fieldTypes[0];
}

const DraggableFieldType = ({ fieldType }: DraggableFieldTypeProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${fieldType.type}`,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        p-3 border rounded-lg cursor-grab hover:border-quikle-primary 
        transition-all duration-200 bg-white hover:shadow-md
        ${isDragging ? 'opacity-50 shadow-lg scale-105' : ''}
      `}
    >
      <div className="flex items-center gap-2 mb-1">
        <fieldType.icon className="w-4 h-4 text-quikle-primary" />
        <span className="font-medium text-sm">{fieldType.label}</span>
        <Grip className="w-3 h-3 text-muted-foreground ml-auto" />
      </div>
      <p className="text-xs text-muted-foreground">{fieldType.description}</p>
    </div>
  );
};

const FieldTypePalette = () => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Field Types</CardTitle>
        <p className="text-sm text-muted-foreground">
          Drag these field types to build your template
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {fieldTypes.map((fieldType) => (
            <DraggableFieldType key={fieldType.type} fieldType={fieldType} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FieldTypePalette;
