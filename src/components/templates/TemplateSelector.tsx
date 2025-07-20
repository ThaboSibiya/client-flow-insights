
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IndustryTemplate, TemplateField } from '@/types/templates';
import { Building2, Printer, Shield, Home, Car, Monitor, Eye } from 'lucide-react';
import TemplatePreviewDialog from './TemplatePreviewDialog';

interface TemplateSelectorProps {
  templates: IndustryTemplate[];
  selectedTemplate: IndustryTemplate | null;
  onSelectTemplate: (template: IndustryTemplate | null) => void;
  templateFields: TemplateField[];
  customFieldValues: Record<string, string>;
  onFieldValueChange: (fieldId: string, value: string) => void;
  fieldsLoading?: boolean;
  loading?: boolean;
}

const getTemplateIcon = (industry: string) => {
  switch (industry) {
    case 'printer_services':
      return <Printer className="h-5 w-5" />;
    case 'insurance':
      return <Shield className="h-5 w-5" />;
    case 'real_estate':
      return <Home className="h-5 w-5" />;
    case 'automotive':
      return <Car className="h-5 w-5" />;
    case 'it_services':
      return <Monitor className="h-5 w-5" />;
    default:
      return <Building2 className="h-5 w-5" />;
  }
};

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplate,
  onSelectTemplate,
  templateFields,
  customFieldValues,
  onFieldValueChange,
  fieldsLoading = false,
  loading = false
}) => {
  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-white via-quikle-crystal to-quikle-platinum border-quikle-silver/30 shadow-luxury">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-quikle-primary to-quikle-secondary bg-clip-text text-transparent">
            Loading Templates...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-quikle-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white via-quikle-crystal to-quikle-platinum border-quikle-silver/30 shadow-luxury">
      <CardHeader>
        <CardTitle className="bg-gradient-to-r from-quikle-primary to-quikle-secondary bg-clip-text text-transparent">
          Select Industry Template (Optional)
        </CardTitle>
        <p className="text-quikle-slate text-sm">
          Choose a template to add industry-specific fields to your customer profile
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            variant={selectedTemplate === null ? "default" : "outline"}
            className={`h-auto p-4 justify-start transition-all duration-200 ${
              selectedTemplate === null 
                ? "bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white shadow-md" 
                : "border-quikle-silver/50 hover:border-quikle-primary/30 hover:bg-quikle-crystal/30"
            }`}
            onClick={() => onSelectTemplate(null)}
          >
            <Building2 className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">No Template</div>
              <div className="text-xs opacity-75">Use basic customer fields only</div>
            </div>
          </Button>

          {templates.map((template) => (
            <Button
              key={template.id}
              variant={selectedTemplate?.id === template.id ? "default" : "outline"}
              className={`h-auto p-4 justify-start transition-all duration-200 transform hover:scale-[1.02] ${
                selectedTemplate?.id === template.id 
                  ? "bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white shadow-md" 
                  : "border-quikle-silver/50 hover:border-quikle-primary/30 hover:bg-quikle-crystal/30"
              }`}
              onClick={() => onSelectTemplate(template)}
            >
              <div className="mr-3">
                {getTemplateIcon(template.industry)}
              </div>
              <div className="text-left flex-1">
                <div className="font-medium">{template.name}</div>
                <div className="text-xs opacity-75">{template.description}</div>
              </div>
              {selectedTemplate?.id === template.id && (
                <Eye className="h-4 w-4 ml-2 animate-pulse" />
              )}
            </Button>
          ))}
        </div>

        {selectedTemplate && (
          <div className="mt-4 p-4 bg-gradient-to-r from-quikle-crystal/50 to-quikle-platinum/50 rounded-lg border border-quikle-primary/20 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-quikle-primary/10 text-quikle-primary">
                  Selected
                </Badge>
                <span className="text-sm font-medium">{selectedTemplate.name}</span>
              </div>
              <TemplatePreviewDialog
                template={selectedTemplate}
                fields={templateFields}
                customFieldValues={customFieldValues}
                onFieldValueChange={onFieldValueChange}
                loading={fieldsLoading}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto p-2 text-quikle-primary hover:bg-quikle-primary/10 border-quikle-primary/30"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview & Edit
                </Button>
              </TemplatePreviewDialog>
            </div>
            <p className="text-xs text-quikle-slate">{selectedTemplate.description}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="secondary" className="bg-blue-50 text-blue-600 text-xs">
                {templateFields.filter(f => f.is_required).length} required
              </Badge>
              <Badge variant="secondary" className="bg-green-50 text-green-600 text-xs">
                {templateFields.filter(f => !f.is_required).length} optional
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TemplateSelector;
