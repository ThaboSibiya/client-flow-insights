import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { IndustryTemplate } from '@/types/templates';
import { useCustomTemplates } from '@/hooks/useCustomTemplates';
import { templateService } from '@/services/templateService';
import { useQuery } from '@tanstack/react-query';
import VisualTemplateCard from '../VisualTemplateCard';

interface TemplateSelectionStepProps {
  selectedTemplate: IndustryTemplate | null;
  onSelectTemplate: (template: IndustryTemplate | null) => void;
  fieldsLoading: boolean;
}

const TemplateSelectionStep: React.FC<TemplateSelectionStepProps> = ({
  selectedTemplate,
  onSelectTemplate,
  fieldsLoading,
}) => {
  const { templates, loading: templatesLoading } = useCustomTemplates();

  // Fetch field counts for all templates in a single batch
  const { data: fieldCounts } = useQuery({
    queryKey: ['template-field-counts', templates.map(t => t.id).join(',')],
    queryFn: async () => {
      const counts: Record<string, number> = {};
      const results = await Promise.all(
        templates.map(async (t) => {
          const fields = await templateService.getTemplateFields(t.id);
          return { id: t.id, count: fields.length };
        })
      );
      results.forEach(r => { counts[r.id] = r.count; });
      return counts;
    },
    enabled: templates.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  if (templatesLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-quikle-primary mb-4" />
        <p className="text-quikle-slate">Loading templates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-quikle-charcoal mb-2">
          Choose an Industry Template
        </h2>
        <p className="text-quikle-slate">
          Select a template to add industry-specific fields, or skip to use basic fields only
        </p>
      </div>

      {/* Skip Template Option */}
      <div className="flex justify-center">
        <Button
          variant={selectedTemplate === null ? "default" : "outline"}
          onClick={() => onSelectTemplate(null)}
          className={selectedTemplate === null 
            ? "bg-gradient-to-r from-quikle-primary to-quikle-secondary" 
            : "border-quikle-silver/50"
          }
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Skip Template (Basic Fields Only)
        </Button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-quikle-silver/30" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-4 text-quikle-slate">or choose a template</span>
        </div>
      </div>

      {/* Template Grid */}
      {templates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-quikle-slate mb-4">No templates available yet.</p>
          <p className="text-sm text-quikle-slate">
            You can create custom templates in the Templates tab.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <VisualTemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplate?.id === template.id}
              onClick={() => onSelectTemplate(template)}
              fieldsCount={fieldCounts?.[template.id] ?? 0}
            />
          ))}
        </div>
      )}

      {/* Loading indicator for fields */}
      {fieldsLoading && (
        <div className="flex items-center justify-center gap-2 text-quikle-primary">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading template fields...</span>
        </div>
      )}
    </div>
  );
};

export default TemplateSelectionStep;
