import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  AlertCircle, 
  CheckCircle,
  X,
  ArrowLeft,
  Loader2,
  FileUp,
  Trash2
} from 'lucide-react';
import { useCRM } from '@/context/CRMContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImportRow {
  name: string;
  email: string;
  phone?: string;
  status: 'new' | 'existing' | 'pending' | 'finalised';
  notes?: string;
  errors?: string[];
}

interface ModernBulkImportProps {
  onBack: () => void;
}

const ModernBulkImport: React.FC<ModernBulkImportProps> = ({ onBack }) => {
  const { addCustomer } = useCRM();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [importData, setImportData] = useState<ImportRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ success: number; errors: number } | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

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

    return lines.slice(1).map((line) => {
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
    }).filter(row => row.name || row.email);
  }, []);

  const handleFile = useCallback(async (file: File) => {
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
      setFileName(file.name);
      setResults(null);
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
  }, [parseCSV]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const processImport = useCallback(async () => {
    if (!user || importData.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < importData.length; i++) {
      const row = importData[i];
      
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
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const validRows = importData.filter(row => !row.errors?.length);
  const errorRows = importData.filter(row => row.errors?.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-quikle-slate hover:text-quikle-charcoal"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <div>
          <h2 className="text-xl font-semibold text-quikle-charcoal">Bulk Import</h2>
          <p className="text-sm text-quikle-slate">Import multiple customers from CSV or Excel</p>
        </div>
      </div>

      {!user && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You must be logged in to import customers.
          </AlertDescription>
        </Alert>
      )}

      {/* Drop Zone */}
      {importData.length === 0 && (
        <Card
          className={cn(
            "border-2 border-dashed transition-all duration-300 cursor-pointer",
            isDragging 
              ? "border-quikle-primary bg-quikle-primary/5 scale-[1.02]" 
              : "border-quikle-silver/50 hover:border-quikle-primary/50"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors",
              isDragging ? "bg-quikle-primary/20" : "bg-quikle-crystal"
            )}>
              <FileUp className={cn(
                "w-8 h-8 transition-colors",
                isDragging ? "text-quikle-primary" : "text-quikle-slate"
              )} />
            </div>
            <p className="font-medium text-quikle-charcoal mb-1">
              {isDragging ? "Drop your file here" : "Drag & drop your file here"}
            </p>
            <p className="text-sm text-quikle-slate mb-4">
              or click to browse
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline">CSV</Badge>
              <Badge variant="outline">Excel (.xlsx, .xls)</Badge>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileInput}
              className="hidden"
            />
          </CardContent>
        </Card>
      )}

      {/* Template Download */}
      {importData.length === 0 && (
        <div className="flex items-center justify-center">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download Template
          </Button>
        </div>
      )}

      {/* File Loaded State */}
      {importData.length > 0 && (
        <Card className="border-quikle-silver/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-quikle-primary" />
                {fileName}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetImport}
                className="text-quikle-slate hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-700">
                  {validRows.length} valid
                </span>
              </div>
              {errorRows.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">
                    {errorRows.length} errors
                  </span>
                </div>
              )}
            </div>

            {/* Preview Table */}
            <div className="max-h-64 overflow-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-quikle-crystal sticky top-0">
                  <tr>
                    <th className="p-3 text-left font-medium text-quikle-charcoal">Name</th>
                    <th className="p-3 text-left font-medium text-quikle-charcoal">Email</th>
                    <th className="p-3 text-left font-medium text-quikle-charcoal hidden md:table-cell">Phone</th>
                    <th className="p-3 text-left font-medium text-quikle-charcoal">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {importData.slice(0, 10).map((row, index) => (
                    <tr 
                      key={index} 
                      className={cn(
                        "border-t border-quikle-silver/20",
                        row.errors?.length ? 'bg-red-50' : ''
                      )}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {row.errors?.length ? (
                            <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          )}
                          <span className="truncate">{row.name || '-'}</span>
                        </div>
                      </td>
                      <td className="p-3 truncate">{row.email || '-'}</td>
                      <td className="p-3 hidden md:table-cell">{row.phone || '-'}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="capitalize">
                          {row.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {importData.length > 10 && (
                <div className="p-3 text-xs text-quikle-slate border-t bg-quikle-crystal/50">
                  Showing first 10 of {importData.length} rows
                </div>
              )}
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-quikle-slate">Importing customers...</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Results */}
            {results && (
              <Alert variant={results.errors > 0 ? "destructive" : "default"}>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Import completed: {results.success} successful, {results.errors} errors
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                onClick={resetImport}
                disabled={isProcessing}
              >
                Reset
              </Button>
              <Button
                onClick={processImport}
                disabled={isProcessing || !user || validRows.length === 0}
                className="gap-2 bg-gradient-to-r from-quikle-primary to-quikle-secondary"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Import {validRows.length} Customers
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Alert className="bg-quikle-crystal/50 border-quikle-silver/30">
        <AlertCircle className="h-4 w-4 text-quikle-primary" />
        <AlertDescription className="text-quikle-charcoal">
          <strong>File format requirements:</strong>
          <ul className="mt-2 space-y-1 text-sm text-quikle-slate">
            <li>• First row must contain headers: name, email, phone, status, notes</li>
            <li>• Name and email are required fields</li>
            <li>• Status must be one of: new, existing, pending, finalised</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ModernBulkImport;
