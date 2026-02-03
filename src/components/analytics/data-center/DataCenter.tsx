
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Upload } from 'lucide-react';
import ImportHub from './ImportHub';
import ExportHub from './ExportHub';

const DataCenter: React.FC = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="export" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="export" className="gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </TabsTrigger>
          <TabsTrigger value="import" className="gap-2">
            <Upload className="h-4 w-4" />
            Import Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export">
          <ExportHub />
        </TabsContent>

        <TabsContent value="import">
          <ImportHub />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataCenter;
