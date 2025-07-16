
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomDataService } from '@/services/customDataService';
import { IndustryTemplate } from '@/types/customData';
import { Building2, Shield, Heart, Scale, DollarSign, Printer, Loader2, ChevronDown } from 'lucide-react';

interface IndustryTemplateSelectorProps {
  onTemplateSelected: (templateId: string | null) => void;
  selectedTemplateId?: string | null;
}

const IndustryTemplateSelector: React.FC<IndustryTemplateSelectorProps> = ({
  onTemplateSelected,
  selectedTemplateId
}) => {
  const [templates, setTemplates] = useState<IndustryTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const industryIcons = {
    real_estate: Building2,
    insurance: Shield,
    healthcare: Heart,
    legal: Scale,
    finance: DollarSign,
    printer_service: Printer
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await CustomDataService.getIndustryTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedTemplate = () => {
    if (!selectedTemplateId) return null;
    return templates.find(template => template.id === selectedTemplateId);
  };

  const selectedTemplate = getSelectedTemplate();

  if (loading) {
    return (
      <Card className="border-quikle-silver/30 bg-gradient-to-br from-white to-quikle-crystal/30 shadow-luxury">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-quikle-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-quikle-silver/30 bg-gradient-to-br from-white to-quikle-crystal/30 shadow-luxury">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold bg-gradient-to-r from-quikle-primary to-quikle-secondary bg-clip-text text-transparent">
          Choose Your Industry Template
        </CardTitle>
        <p className="text-sm text-quikle-slate/80">
          Select a template to automatically add industry-specific fields to your customers.
          You can always change this later.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-quikle-charcoal">Industry Template</label>
          <Select value={selectedTemplateId || ""} onValueChange={(value) => onTemplateSelected(value || null)}>
            <SelectTrigger className="w-full h-14 border-quikle-silver/40 bg-gradient-to-r from-white to-quikle-crystal/50 hover:border-quikle-primary/40 transition-all duration-200">
              <div className="flex items-center gap-3 flex-1">
                {selectedTemplate ? (
                  <>
                    {React.createElement(industryIcons[selectedTemplate.industry as keyof typeof industryIcons] || Building2, {
                      className: "h-5 w-5 text-quikle-primary"
                    })}
                    <div className="flex-1 text-left">
                      <div className="font-medium text-quikle-charcoal">{selectedTemplate.name}</div>
                      <div className="text-xs text-quikle-slate/70">{selectedTemplate.description}</div>
                    </div>
                  </>
                ) : (
                  <div className="text-quikle-slate/60">Select an industry template...</div>
                )}
              </div>
              <ChevronDown className="h-4 w-4 text-quikle-slate/60" />
            </SelectTrigger>
            <SelectContent className="bg-white border-quikle-silver/30 shadow-luxury backdrop-blur-sm">
              <SelectItem value="" className="h-12 focus:bg-quikle-crystal/50">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded border-2 border-dashed border-quikle-silver/60"></div>
                  <div>
                    <div className="font-medium text-quikle-charcoal">No Template</div>
                    <div className="text-xs text-quikle-slate/70">Use standard customer fields only</div>
                  </div>
                </div>
              </SelectItem>
              
              {templates.map((template) => {
                const Icon = industryIcons[template.industry as keyof typeof industryIcons] || Building2;
                
                return (
                  <SelectItem key={template.id} value={template.id} className="h-16 focus:bg-quikle-crystal/50">
                    <div className="flex items-center gap-3 w-full">
                      <Icon className="h-5 w-5 text-quikle-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-quikle-charcoal">{template.name}</div>
                        <div className="text-xs text-quikle-slate/70 truncate">{template.description}</div>
                        <Badge variant="secondary" className="text-xs mt-1 bg-quikle-crystal/80 text-quikle-primary border-quikle-primary/20">
                          {template.industry.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {selectedTemplate && (
          <div className="mt-4 p-4 bg-gradient-to-r from-quikle-crystal/30 to-quikle-platinum/30 rounded-lg border border-quikle-primary/20">
            <div className="flex items-center gap-2 mb-2">
              {React.createElement(industryIcons[selectedTemplate.industry as keyof typeof industryIcons] || Building2, {
                className: "h-4 w-4 text-quikle-primary"
              })}
              <span className="text-sm font-medium text-quikle-primary">Selected Template</span>
            </div>
            <p className="text-sm text-quikle-slate/80">
              Industry-specific fields will be automatically added to your customer profiles based on the {selectedTemplate.name.toLowerCase()} template.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IndustryTemplateSelector;
