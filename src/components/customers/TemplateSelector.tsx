import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, CheckCircle, Loader2 } from 'lucide-react';
import { templateService } from '@/services/templateService';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface IndustryTemplate {
  id: string;
  name: string;
  industry: string;
  description: string | null;
}

interface TemplateSelectorProps {
  customerId: string;
  onTemplateApplied: () => void;
}

const TemplateSelector = ({ customerId, onTemplateApplied }: TemplateSelectorProps) => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<IndustryTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await templateService.getIndustryTemplates();
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

  const handleApplyTemplate = async (templateId: string) => {
    if (!user?.id) return;
    
    setApplying(templateId);
    try {
      await templateService.applyTemplateToCustomer(customerId, templateId, user.id);
      toast({
        title: "Success",
        description: "Template applied successfully"
      });
      onTemplateApplied();
    } catch (error) {
      console.error('Error applying template:', error);
      toast({
        title: "Error",
        description: "Failed to apply template",
        variant: "destructive"
      });
    } finally {
      setApplying(null);
    }
  };

  if (loading) {
    return (
      <Card className="border-quikle-silver/30">
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-quikle-primary" />
            <p className="text-sm text-quikle-slate">Loading templates...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const businessTemplate = templates.find(t => 
    t.name === 'Business Information' || t.industry === 'general_business'
  );

  if (!businessTemplate) {
    return (
      <Card className="border-dashed border-quikle-silver/50 bg-quikle-crystal/30">
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center gap-2">
            <Building2 className="h-10 w-10 text-quikle-slate/40" />
            <p className="text-sm text-quikle-slate text-center">
              No business information template available
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-quikle-silver/30 bg-white shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-3 bg-gradient-to-br from-quikle-primary/10 to-quikle-accent/10 rounded-xl">
            <Building2 className="h-6 w-6 text-quikle-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg text-quikle-charcoal mb-1">
              {businessTemplate.name}
            </CardTitle>
            <CardDescription className="text-sm text-quikle-slate leading-relaxed">
              {businessTemplate.description || 'Store essential business information for this customer'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          onClick={() => handleApplyTemplate(businessTemplate.id)}
          disabled={applying === businessTemplate.id}
          className="w-full bg-gradient-to-r from-quikle-primary to-quikle-secondary hover:shadow-lg transition-all duration-300"
        >
          {applying === businessTemplate.id ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              <span>Applying template...</span>
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              <span>Apply Template</span>
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TemplateSelector;
