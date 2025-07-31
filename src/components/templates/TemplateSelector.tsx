
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IndustryTemplate, TemplateField } from '@/types/templates';
import { Building2, Printer, Shield, Home, Car, Monitor, Eye, Loader2 } from 'lucide-react';
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
    case 'printer_service':
      return <Printer className="h-4 w-4" />;
    case 'insurance':
      return <Shield className="h-4 w-4" />;
    case 'real_estate':
      return <Home className="h-4 w-4" />;
    case 'automotive':
      return <Car className="h-4 w-4" />;
    case 'it_services':
      return <Monitor className="h-4 w-4" />;
    default:
      return <Building2 className="h-4 w-4" />;
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
  const handleTemplateChange = (value: string) => {
    if (value === 'none') {
      onSelectTemplate(null);
    } else {
      const template = templates.find(t => t.id === value);
      onSelectTemplate(template || null);
    }
  };

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
        <div className="flex items-center gap-2">
          <Select
            value={selectedTemplate?.id || 'none'}
            onValueChange={handleTemplateChange}
            disabled={loading}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={loading ? "Loading templates..." : "Select an industry template"}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : selectedTemplate ? (
                  <div className="flex items-center gap-2">
                    {getTemplateIcon(selectedTemplate.industry)}
                    <span>{selectedTemplate.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>No Template</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <div>
                    <div className="font-medium">No Template</div>
                    <div className="text-xs text-quikle-slate">Use basic customer fields only</div>
                  </div>
                </div>
              </SelectItem>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center gap-2">
                    {getTemplateIcon(template.industry)}
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-quikle-slate">{template.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedTemplate && !fieldsLoading && (
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
                className="h-10 px-3 text-quikle-primary hover:bg-quikle-primary/10 border-quikle-primary/30"
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview & Edit
              </Button>
            </TemplatePreviewDialog>
          )}

          {selectedTemplate && fieldsLoading && (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="h-10 px-3"
            >
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              Loading...
            </Button>
          )}
        </div>

        {selectedTemplate && !fieldsLoading && (
          <div className="p-4 bg-gradient-to-r from-quikle-crystal/50 to-quikle-platinum/50 rounded-lg border border-quikle-primary/20 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-quikle-primary/10 text-quikle-primary">
                Selected
              </Badge>
              <span className="text-sm font-medium">{selectedTemplate.name}</span>
            </div>
            <p className="text-xs text-quikle-slate mb-2">{selectedTemplate.description}</p>
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-blue-50 text-blue-600 text-xs">
                {templateFields.filter(f => f.is_required).length} required
              </Badge>
              <Badge variant="secondary" className="bg-green-50 text-green-600 text-xs">
                {templateFields.filter(f => !f.is_required).length} optional
              </Badge>
            </div>
          </div>
        )}

        {selectedTemplate && fieldsLoading && (
          <div className="p-4 bg-gradient-to-r from-quikle-crystal/50 to-quikle-platinum/50 rounded-lg border border-quikle-primary/20">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-quikle-primary" />
              <span className="text-sm text-quikle-slate">Loading template fields...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TemplateSelector;
