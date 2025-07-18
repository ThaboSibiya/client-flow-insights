
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IndustryTemplate } from '@/types/templates';
import { Building2, Printer, Shield, Home, Car, Monitor } from 'lucide-react';

interface TemplateSelectorProps {
  templates: IndustryTemplate[];
  selectedTemplate: IndustryTemplate | null;
  onSelectTemplate: (template: IndustryTemplate | null) => void;
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
            className={`h-auto p-4 justify-start ${
              selectedTemplate === null 
                ? "bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white" 
                : "border-quikle-silver/50"
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
              className={`h-auto p-4 justify-start ${
                selectedTemplate?.id === template.id 
                  ? "bg-gradient-to-r from-quikle-primary to-quikle-secondary text-white" 
                  : "border-quikle-silver/50"
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
            </Button>
          ))}
        </div>

        {selectedTemplate && (
          <div className="mt-4 p-3 bg-quikle-crystal/50 rounded-lg border border-quikle-primary/20">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-quikle-primary/10 text-quikle-primary">
                Selected
              </Badge>
              <span className="text-sm font-medium">{selectedTemplate.name}</span>
            </div>
            <p className="text-xs text-quikle-slate mt-1">{selectedTemplate.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TemplateSelector;
