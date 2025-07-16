
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TemplateEditor from '@/components/templates/TemplateEditor';
import TemplateLibrary from '@/components/templates/TemplateLibrary';
import CustomTemplateManager from '@/components/templates/CustomTemplateManager';

const TemplateManagement = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-quikle-primary/20 via-quikle-secondary/15 to-quikle-accent/20 p-8 rounded-xl mb-6 shadow-luxury border border-quikle-silver/30 backdrop-blur-sm">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-quikle-primary via-quikle-secondary to-quikle-accent bg-clip-text text-transparent drop-shadow-sm">
          Template Management
        </h1>
        <p className="text-quikle-slate mt-1">Create, edit, and manage your industry templates and custom fields</p>
      </div>

      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-quikle-crystal to-quikle-platinum border border-quikle-silver/30">
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Template Library
          </TabsTrigger>
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Template Editor
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Custom Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="mt-6">
          <TemplateLibrary />
        </TabsContent>

        <TabsContent value="editor" className="mt-6">
          <TemplateEditor />
        </TabsContent>

        <TabsContent value="custom" className="mt-6">
          <CustomTemplateManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TemplateManagement;
