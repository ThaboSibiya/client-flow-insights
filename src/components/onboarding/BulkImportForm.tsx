
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const BulkImportForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select a CSV file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      // TODO: Implement bulk import logic
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate upload
      
      toast({
        title: "Success",
        description: "Customers imported successfully!",
      });
      
      setFile(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import customers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `name,email,phone,contact_person,address,company_address,status,notes
Example Company,contact@example.com,(555) 123-4567,John Doe,"123 Main St, City, State 12345","456 Business Ave, City, State 12345",new,Sample customer notes`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'customer_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Bulk import allows you to add multiple customers at once using a CSV file. 
          Download the template below to ensure your data is formatted correctly.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            CSV Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Download our CSV template to ensure your customer data is formatted correctly for import.
          </p>
          <Button onClick={downloadTemplate} variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download CSV Template
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Customer Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">Select CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-muted file:text-muted-foreground hover:file:bg-muted/80"
            />
          </div>

          {file && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Selected file:</strong> {file.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Size: {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

          <Button 
            onClick={handleUpload} 
            disabled={!file || isUploading}
            className="w-full"
          >
            {isUploading ? "Importing..." : "Import Customers"}
          </Button>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• CSV file should include headers: name, email, phone, contact_person, address, company_address, status, notes</p>
            <p>• Maximum file size: 5MB</p>
            <p>• Status values: new, active, inactive, prospect</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkImportForm;
