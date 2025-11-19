
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomTemplates } from '@/hooks/useCustomTemplates';
import CustomTemplateManager from '@/components/templates/CustomTemplateManager';
import TemplateBuilder from '@/components/templates/builder/TemplateBuilder';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Palette, Building, Eye } from "lucide-react";

const Templates = () => {
  const { templates: industryTemplates, loading } = useCustomTemplates();
  const [showCustomBuilder, setShowCustomBuilder] = useState(false);

  if (showCustomBuilder) {
    return (
      <div className="container mx-auto px-4 py-6">
        <TemplateBuilder onBack={() => setShowCustomBuilder(false)} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Templates</h1>
        <p className="text-muted-foreground">
          Manage industry templates and create custom templates for your business needs
        </p>
      </div>

      <Tabs defaultValue="industry" className="space-y-6">
        <TabsList className="w-full overflow-x-auto flex md:grid md:grid-cols-2 max-w-md">
          <TabsTrigger value="industry" className="flex items-center gap-2 flex-1 md:flex-initial whitespace-nowrap">
            <Building className="w-4 h-4" />
            Industry
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2 flex-1 md:flex-initial whitespace-nowrap">
            <Palette className="w-4 h-4" />
            Custom
          </TabsTrigger>
        </TabsList>

        <TabsContent value="industry" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Available Industry Templates</h2>
              <p className="text-sm text-muted-foreground">
                Pre-built templates for common industries or create your own
              </p>
            </div>
            <Button 
              onClick={() => setShowCustomBuilder(true)} 
              className="bg-quikle-primary hover:bg-quikle-primary/90 flex items-center gap-2"
              size="default"
            >
              <Plus className="w-4 h-4" />
              Create Custom Template
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {industryTemplates.map((template) => (
                    <div key={template.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{template.name}</h3>
                        <Badge variant="outline">{template.industry}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        View Template
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <CustomTemplateManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Templates;
