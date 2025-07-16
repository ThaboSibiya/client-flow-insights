
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TemplateGallery from '@/components/templates/TemplateGallery';
import TemplateEditor from '@/components/templates/TemplateEditor';
import { Plus, Edit, Eye } from 'lucide-react';

const TemplateManagement = () => {
  const [activeTab, setActiveTab] = useState('gallery');

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Template Management</h1>
          <p className="text-gray-600">Manage your industry templates and custom fields here.</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Template Gallery
            </TabsTrigger>
            <TabsTrigger value="editor" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Template Editor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="mt-6">
            <TemplateGallery />
          </TabsContent>

          <TabsContent value="editor" className="mt-6">
            <TemplateEditor />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TemplateManagement;
