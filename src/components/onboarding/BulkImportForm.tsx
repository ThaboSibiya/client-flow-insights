
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useCRM } from '@/context/CRMContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle } from 'lucide-react';

interface ImportRow {
  name: string;
  email: string;
  phone?: string;
  status: 'new' | 'existing' | 'pending' | 'finalised';
  notes?: string;
  errors?: string[];
}

interface BulkImportFormProps {}

const BulkImportForm: React.FC<BulkImportFormProps> = () => {
  const { addCustomer } = useCRM();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importData, setImportData] = useState<ImportRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ success: number; errors: number } | null>(null);

  const downloadTemplate = useCallback(() => {
    const template = [
      ['name', 'email', 'phone', 'status', 'notes'],
      ['John Smith', 'john@example.com', '555-1234', 'new', 'Sample customer'],
      ['Jane Doe', 'jane@example.com', '555-5678', 'existing', 'Returning customer']
    ];

    const csvContent = template.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }, []);

  const parseCSV = useCallback((text: string): ImportRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
    const nameIndex = headers.indexOf('name');
    const emailIndex = headers.indexOf('email');
    const phoneIndex = headers.indexOf('phone');
    const statusIndex = headers.indexOf('status');
    const notesIndex = headers.indexOf('notes');

    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.replace(/"/g, '').trim());
      const row: ImportRow = {
        name: values[nameIndex] || '',
        email: values[emailIndex] || '',
        phone: values[phoneIndex] || '',
        status: (values[statusIndex] as any) || 'new',
        notes: values[notesIndex] || '',
        errors: []
      };

      // Validate required fields
      if (!row.name) row.errors?.push('Name is required');
      if (!row.email) row.errors?.push('Email is required');
      if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        row.errors?.push('Invalid email format');
      }
      if (!['new', 'existing', 'pending', 'finalised'].includes(row.status)) {
        row.status = 'new';
      }

      return row;
    }).filter(row => row.name || row.email); // Filter out completely empty rows
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV or Excel file",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await file.text();
      const data = parseCSV(text);
      
      if (data.length === 0) {
        toast({
          title: "No data found",
          description: "The file appears to be empty or invalid",
          variant: "destructive",
        });
        return;
      }

      setImportData(data);
      toast({
        title: "File loaded",
        description: `Found ${data.length} rows to import`,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error reading file",
        description: `Could not parse the file: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const processImport = useCallback(async () => {
    if (!user || importData.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < importData.length; i++) {
      const row = importData[i];
      
      // Skip rows with validation errors
      if (row.errors && row.errors.length > 0) {
        errorCount++;
        setProgress(((i + 1) / importData.length) * 100);
        continue;
      }

      try {
        await addCustomer({
          name: row.name,
          email: row.email,
          phone: row.phone || '',
          status: row.status,
          notes: row.notes || '',
        });
        successCount++;
      } catch (error) {
        errorCount++;
        console.error(`Error importing customer ${row.name}:`, error);
      }

      setProgress(((i + 1) / importData.length) * 100);
      
      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setResults({ success: successCount, errors: errorCount });
    setIsProcessing(false);
    
    toast({
      title: "Import completed",
      description: `Successfully imported ${successCount} customers. ${errorCount} errors.`,
      variant: errorCount > 0 ? "destructive" : "default",
    });
  }, [user, importData, addCustomer]);

  const resetImport = useCallback(() => {
    setImportData([]);
    setResults(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Bulk Customer Import
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!user && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You must be logged in to import customers.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="file-upload">Upload CSV or Excel file</Label>
            <div className="flex gap-2 mt-2">
              <Input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isProcessing || !user}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={downloadTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Template
              </Button>
            </div>
          </div>

          {importData.length > 0 && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Ready to import {importData.filter(row => !row.errors?.length).length} valid customers.
                  {importData.filter(row => row.errors?.length).length > 0 && (
                    <span className="text-red-600 ml-2">
                      {importData.filter(row => row.errors?.length).length} rows have errors and will be skipped.
                    </span>
                  )}
                </AlertDescription>
              </Alert>

              {/* Preview table */}
              <div className="max-h-64 overflow-auto border rounded">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Phone</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importData.slice(0, 10).map((row, index) => (
                      <tr key={index} className={row.errors?.length ? 'bg-red-50' : ''}>
                        <td className="p-2">{row.name}</td>
                        <td className="p-2">{row.email}</td>
                        <td className="p-2">{row.phone}</td>
                        <td className="p-2">{row.status}</td>
                        <td className="p-2 text-red-600 text-xs">
                          {row.errors?.join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {importData.length > 10 && (
                  <div className="p-2 text-xs text-gray-500 border-t">
                    Showing first 10 rows of {importData.length}
                  </div>
                )}
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Importing customers...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {results && (
                <Alert variant={results.errors > 0 ? "destructive" : "default"}>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Import completed: {results.success} successful, {results.errors} errors
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={processImport}
                  disabled={isProcessing || !user || importData.filter(row => !row.errors?.length).length === 0}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {isProcessing ? 'Importing...' : 'Import Customers'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetImport}
                  disabled={isProcessing}
                >
                  Reset
                </Button>
              </div>
            </div>
          )}
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>File format requirements:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• First row must contain headers: name, email, phone, status, notes</li>
              <li>• Name and email are required fields</li>
              <li>• Status must be one of: new, existing, pending, finalised</li>
              <li>• Supported formats: CSV, Excel (.xlsx, .xls)</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default BulkImportForm;
