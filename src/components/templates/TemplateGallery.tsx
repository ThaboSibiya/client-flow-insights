
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CustomDataService } from '@/services/customDataService';
import { IndustryTemplate } from '@/types/customData';
import { Building2, Shield, Heart, Scale, DollarSign, Printer, Loader2, Plus, Edit } from 'lucide-react';

interface TemplateGalleryProps {
  customerId?: string;
  onTemplateApplied?: (template: IndustryTemplate) => void;
  appliedTemplateIds?: string[];
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ 
  customerId, 
  onTemplateApplied, 
  appliedTemplateIds = [] 
}) => {
  const [templates, setTemplates] = useState<IndustryTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = async (template: IndustryTemplate) => {
    if (!customerId) return;

    try {
      await CustomDataService.applyTemplateToCustomer(customerId, template.id);
      
      toast({
        title: "Success",
        description: `${template.name} has been applied to this customer.`
      });

      if (onTemplateApplied) {
        onTemplateApplied(template);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to apply template",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading templates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const Icon = industryIcons[template.industry as keyof typeof industryIcons] || Building2;
          const isApplied = appliedTemplateIds.includes(template.id);

          return (
            <Card key={template.id} className="border-quikle-silver/30 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-quikle-crystal/50 rounded-md p-2">
                      <Icon className="h-6 w-6 text-quikle-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-quikle-charcoal">{template.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {template.industry.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  {isApplied && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Applied
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-quikle-slate mb-4">{template.description}</p>
                
                <div className="flex gap-2">
                  {customerId && (
                    <Button
                      onClick={() => handleApplyTemplate(template)}
                      disabled={isApplied}
                      size="sm"
                      className="flex-1"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {isApplied ? 'Applied' : 'Apply Template'}
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/template-management?edit=${template.id}`, '_blank')}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-16 w-16 text-quikle-slate mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-quikle-charcoal mb-2">No templates available</h3>
          <p className="text-quikle-slate">Templates will appear here once they are configured.</p>
        </div>
      )}
    </div>
  );
};

export default TemplateGallery;
