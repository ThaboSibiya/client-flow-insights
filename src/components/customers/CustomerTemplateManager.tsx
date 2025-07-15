
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useCustomerTemplates } from '@/hooks/useCustomerTemplates';
import TemplateGallery from '@/components/templates/TemplateGallery';
import CustomFieldsDisplay from '@/components/templates/CustomFieldsDisplay';
import CustomFieldsForm from '@/components/templates/CustomFieldsForm';
import { IndustryTemplate } from '@/types/customData';
import { Trash2, Plus } from 'lucide-react';

interface CustomerTemplateManagerProps {
  customerId: string;
}

const CustomerTemplateManager: React.FC<CustomerTemplateManagerProps> = ({ customerId }) => {
  const [activeTab, setActiveTab] = useState('view');
  const { enhancedCustomer, loading, refetch, removeTemplate } = useCustomerTemplates(customerId);
  const { toast } = useToast();

  const handleTemplateApplied = (template: IndustryTemplate) => {
    toast({
      title: "Template Applied",
      description: `${template.name} has been applied to this customer.`
    });
    refetch();
    setActiveTab('view');
  };

  const handleRemoveTemplate = async (templateId: string, templateName: string) => {
    try {
      await removeTemplate(templateId);
      toast({
        title: "Template Removed",
        description: `${templateName} has been removed from this customer.`
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove template",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-pulse">Loading customer templates...</div>
        </CardContent>
      </Card>
    );
  }

  if (!enhancedCustomer) {
    return null;
  }

  const appliedTemplateIds = enhancedCustomer.applied_templates.map(t => t.id);

  return (
    <div className="space-y-6">
      {/* Applied Templates Summary */}
      {enhancedCustomer.applied_templates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Applied Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {enhancedCustomer.applied_templates.map((template) => (
                <div key={template.id} className="flex items-center gap-2">
                  <Badge variant="default" className="flex items-center gap-1">
                    {template.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-red-100"
                      onClick={() => handleRemoveTemplate(template.id, template.name)}
                    >
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </Button>
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="view">View Data</TabsTrigger>
          <TabsTrigger value="edit">Edit Data</TabsTrigger>
          <TabsTrigger value="templates">
            <Plus className="h-4 w-4 mr-1" />
            Add Template
          </TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="mt-6">
          {enhancedCustomer.custom_fields.length > 0 ? (
            <CustomFieldsDisplay 
              customFields={enhancedCustomer.custom_fields}
              showEmpty={true}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  No custom fields available. Apply a template to add industry-specific data.
                </p>
                <Button 
                  onClick={() => setActiveTab('templates')} 
                  className="mt-4"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Template
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="edit" className="mt-6">
          {enhancedCustomer.custom_fields.length > 0 ? (
            <CustomFieldsForm
              customerId={customerId}
              customFields={enhancedCustomer.custom_fields}
              onFieldsUpdated={refetch}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  No custom fields to edit. Apply a template first.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <TemplateGallery
            customerId={customerId}
            onTemplateApplied={handleTemplateApplied}
            appliedTemplateIds={appliedTemplateIds}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerTemplateManager;
