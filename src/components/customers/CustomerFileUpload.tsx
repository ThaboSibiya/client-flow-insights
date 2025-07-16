
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText } from 'lucide-react';

interface CustomerFileUploadProps {
  customerId: string;
}

const CustomerFileUpload = ({ customerId }: CustomerFileUploadProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">File upload functionality for customer {customerId}</p>
          <p className="text-sm text-gray-400 mt-2">This feature is not yet implemented</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerFileUpload;
