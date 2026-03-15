import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Plus, Trash2, Wand2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ImportDataType, ValueTransform, STATUS_PRESETS, CRM_FIELDS, FieldMapping } from './types';

interface ValueTransformEditorProps {
  dataType: ImportDataType;
  fieldMappings: FieldMapping[];
  transforms: ValueTransform[];
  onUpdateTransforms: (transforms: ValueTransform[]) => void;
  onBack: () => void;
  onContinue: () => void;
}

const ValueTransformEditor = ({
  dataType, fieldMappings, transforms, onUpdateTransforms, onBack, onContinue,
}: ValueTransformEditorProps) => {
  const [activeField, setActiveField] = useState<string | null>(null);

  const mappedFields = CRM_FIELDS[dataType]
    .filter(f => fieldMappings.some(m => m.crmField === f.field && m.crmField !== '_skip'))
    .filter(f => ['status', 'priority'].includes(f.field));

  const getTransformForField = (field: string): ValueTransform => {
    return transforms.find(t => t.field === field) || { field, rules: [] };
  };

  const updateFieldTransform = (field: string, rules: { from: string; to: string }[]) => {
    const existing = transforms.filter(t => t.field !== field);
    if (rules.length > 0) {
      onUpdateTransforms([...existing, { field, rules }]);
    } else {
      onUpdateTransforms(existing);
    }
  };

  const addRule = (field: string) => {
    const current = getTransformForField(field);
    updateFieldTransform(field, [...current.rules, { from: '', to: '' }]);
  };

  const removeRule = (field: string, index: number) => {
    const current = getTransformForField(field);
    updateFieldTransform(field, current.rules.filter((_, i) => i !== index));
  };

  const updateRule = (field: string, index: number, key: 'from' | 'to', value: string) => {
    const current = getTransformForField(field);
    const updated = current.rules.map((r, i) => i === index ? { ...r, [key]: value } : r);
    updateFieldTransform(field, updated);
  };

  const applyPreset = (field: string) => {
    const presets = STATUS_PRESETS[dataType] || [];
    updateFieldTransform(field, [...presets]);
    setActiveField(field);
  };

  const totalRules = transforms.reduce((sum, t) => sum + t.rules.length, 0);

  if (mappedFields.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-foreground">Value Transformations</h3>
          <p className="text-xs text-muted-foreground mt-1">
            No status or priority fields mapped — nothing to transform.
          </p>
        </div>
        <div className="flex justify-between pt-1">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Button size="sm" onClick={onContinue}>
            Skip & Preview <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-foreground">Value Transformations</h3>
          <p className="text-xs text-muted-foreground">
            Map source values to your system values • {totalRules} rule{totalRules !== 1 ? 's' : ''} defined
          </p>
        </div>
        {totalRules > 0 && (
          <Badge variant="secondary" className="text-xs">
            <Wand2 className="h-3 w-3 mr-1" /> {totalRules} rules
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {mappedFields.map(field => {
          const transform = getTransformForField(field.field);
          const isActive = activeField === field.field;

          return (
            <Card key={field.field} className="overflow-hidden">
              <CardContent className="p-0">
                <button
                  type="button"
                  onClick={() => setActiveField(isActive ? null : field.field)}
                  className="w-full p-3 flex items-center justify-between hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{field.label}</span>
                    {transform.rules.length > 0 && (
                      <Badge variant="secondary" className="text-[10px]">
                        {transform.rules.length} rules
                      </Badge>
                    )}
                  </div>
                  <ArrowRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isActive ? 'rotate-90' : ''}`} />
                </button>

                {isActive && (
                  <div className="px-3 pb-3 space-y-2 border-t bg-muted/10">
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => applyPreset(field.field)}
                      >
                        <Sparkles className="h-3 w-3 mr-1" /> Load Presets
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7"
                        onClick={() => addRule(field.field)}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Rule
                      </Button>
                    </div>

                    {transform.rules.length === 0 && (
                      <p className="text-xs text-muted-foreground py-2 text-center">
                        No rules — values will be imported as-is
                      </p>
                    )}

                    <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                      {transform.rules.map((rule, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Input
                            value={rule.from}
                            onChange={(e) => updateRule(field.field, i, 'from', e.target.value)}
                            placeholder="Source value"
                            className="h-7 text-xs flex-1"
                          />
                          <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                          <Input
                            value={rule.to}
                            onChange={(e) => updateRule(field.field, i, 'to', e.target.value)}
                            placeholder="Target value"
                            className="h-7 text-xs flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeRule(field.field, i)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-between pt-1">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <Button size="sm" onClick={onContinue}>
          Preview <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default ValueTransformEditor;
