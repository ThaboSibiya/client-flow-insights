
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CustomDataService } from '@/services/customDataService';
import { IndustryTemplate } from '@/types/customData';
import { useAuth } from '@/context/AuthContext';
import { Building2, Shield, Heart, Scale, DollarSign, Loader2 } from 'lucide-react';

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
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const industryIcons = {
    real_estate: Building2,
    insurance: Shield,
    healthcare: Heart,
    legal: Scale,
    finance: DollarSign
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
    if (!customerId || !user) return;

    setApplyingId(template.id);
    try {
      await CustomDataService.applyTemplateToCustomer(customerId, template.id, user.id);
      toast({
        title: "Success",
        description: `${template.name} template applied successfully`
      });
      onTemplateApplied?.(template);
    } catch (error: any) {
      console.error('Error applying template:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to apply template",
        variant: "destructive"
      });
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Industry Templates</h2>
        <p className="text-muted-foreground">
          Choose a template to add industry-specific fields to your customers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const Icon = industryIcons[template.industry as keyof typeof industryIcons] || Building2;
          const isApplied = appliedTemplateIds.includes(template.id);
          const isApplying = applyingId === template.id;

          return (
            <Card key={template.id} className={`transition-all hover:shadow-lg ${isApplied ? 'border-green-500 bg-green-50' : ''}`}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Icon className="h-8 w-8 text-primary" />
                  <div className="flex-1">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {template.industry.replace('_', ' ')}
                      </Badge>
                      {isApplied && (
                        <Badge variant="default" className="text-xs bg-green-600">
                          Applied
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {template.description}
                </CardDescription>
                
                {customerId && (
                  <Button
                    onClick={() => handleApplyTemplate(template)}
                    disabled={isApplied || isApplying}
                    className="w-full"
                    variant={isApplied ? "secondary" : "default"}
                  >
                    {isApplying && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    {isApplied ? 'Applied' : 'Apply Template'}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TemplateGallery;
