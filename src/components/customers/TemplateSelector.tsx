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
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const businessTemplate = templates.find(t => 
    t.name === 'Business Information' || t.industry === 'general_business'
  );

  if (!businessTemplate) {
    return (
      <Card className="bg-accent/50 border-dashed">
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground text-center">
            No business information template available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-background to-accent/30 border-primary/20 hover:border-primary/40 transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{businessTemplate.name}</CardTitle>
              <CardDescription>
                {businessTemplate.description || 'Store essential business information for this customer'}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => handleApplyTemplate(businessTemplate.id)}
          disabled={applying === businessTemplate.id}
          className="w-full bg-gradient-to-r from-primary to-primary/80"
        >
          {applying === businessTemplate.id ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Applying...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Apply Template
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TemplateSelector;
