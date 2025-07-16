import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CustomDataService } from '@/services/customDataService';
import { IndustryTemplate } from '@/types/customData';
import { Building2, Shield, Heart, Scale, DollarSign, Printer, Loader2 } from 'lucide-react';

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

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose Your Industry Template (Optional)</CardTitle>
        <p className="text-sm text-muted-foreground">
          Select a template to automatically add industry-specific fields to your customers.
          You can always change this later.
        </p>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={selectedTemplateId || ''} 
          onValueChange={(value) => onTemplateSelected(value || null)}
        >
          <div className="flex items-center space-x-2 mb-4">
            <RadioGroupItem value="" id="none" />
            <Label htmlFor="none" className="flex-1 cursor-pointer">
              <div className="p-3 border rounded-lg hover:bg-gray-50">
                <div className="font-medium">No Template</div>
                <div className="text-sm text-gray-500">
                  Use standard customer fields only
                </div>
              </div>
            </Label>
          </div>

          {templates.map((template) => {
            const Icon = industryIcons[template.industry as keyof typeof industryIcons] || Building2;
            
            return (
              <div key={template.id} className="flex items-center space-x-2 mb-4">
                <RadioGroupItem value={template.id} id={template.id} />
                <Label htmlFor={template.id} className="flex-1 cursor-pointer">
                  <div className="p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Icon className="h-6 w-6 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-500">{template.description}</div>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {template.industry.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default IndustryTemplateSelector;
