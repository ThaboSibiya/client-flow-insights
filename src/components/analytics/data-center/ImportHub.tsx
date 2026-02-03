
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileSpreadsheet, 
  Database, 
  Cloud, 
  CheckCircle2, 
  AlertCircle,
  FileJson,
  Link2,
  Loader2,
  Eye,
  Trash2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { parseCSV, parseJSON, parseExcel, detectFileType } from '@/utils/file-parser';
import { useAnalytics } from '@/context/AnalyticsContext';
import { ImportedDataset } from '@/hooks/useAnalyticsData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImportSource {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  formats: string[];
}

const importSources: ImportSource[] = [
  {
    id: 'file',
    name: 'File Upload',
    icon: <Upload className="h-5 w-5" />,
    description: 'Upload CSV, Excel, or JSON files',
    formats: ['CSV', 'XLSX', 'XLS', 'JSON']
  },
  {
    id: 'google',
    name: 'Google Sheets',
    icon: <FileSpreadsheet className="h-5 w-5" />,
    description: 'Connect to Google Sheets',
    formats: ['Google Sheets']
  },
  {
    id: 'api',
    name: 'API Connection',
    icon: <Database className="h-5 w-5" />,
    description: 'Connect via REST API',
    formats: ['REST', 'GraphQL']
  },
  {
    id: 'cloud',
    name: 'Cloud Storage',
    icon: <Cloud className="h-5 w-5" />,
    description: 'Import from cloud storage',
    formats: ['S3', 'Azure', 'GCP']
  }
];

interface ImportHubProps {
  onImportComplete?: (data: ImportedDataset) => void;
}

const ImportHub: React.FC<ImportHubProps> = ({ onImportComplete }) => {
  const [selectedSource, setSelectedSource] = useState<string>('file');
  const [isImporting, setIsImporting] = useState(false);
  const [previewDataset, setPreviewDataset] = useState<ImportedDataset | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const { importedDatasets, addImportedDataset, removeImportedDataset, setActiveDataset } = useAnalytics();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    try {
      const fileType = detectFileType(file);
      let parsedData;

      if (fileType === 'csv') {
        const content = await file.text();
        parsedData = parseCSV(content);
      } else if (fileType === 'json') {
        const content = await file.text();
        parsedData = parseJSON(content);
      } else if (fileType === 'excel') {
        parsedData = await parseExcel(file);
      } else {
        throw new Error('Unsupported file type. Please use CSV, JSON, or Excel files.');
      }

      if (parsedData.errors.length > 0) {
        toast({
          title: "Import Warning",
          description: parsedData.errors.join(', '),
          variant: "destructive"
        });
      }

      if (parsedData.data.length === 0) {
        throw new Error('No data found in file');
      }

      const dataset: ImportedDataset = {
        id: `import-${Date.now()}`,
        name: file.name,
        data: parsedData.data,
        columns: parsedData.columns,
        importedAt: new Date(),
        rowCount: parsedData.rowCount
      };

      addImportedDataset(dataset);
      
      toast({
        title: "Import Successful",
        description: `${file.name} imported with ${dataset.rowCount} rows and ${dataset.columns.length} columns`,
      });
      
      onImportComplete?.(dataset);
      
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : 'Failed to import file',
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePreview = (dataset: ImportedDataset) => {
    setPreviewDataset(dataset);
    setShowPreview(true);
  };

  const handleSetActive = (dataset: ImportedDataset) => {
    setActiveDataset(dataset);
    toast({
      title: "Dataset Activated",
      description: `${dataset.name} is now the active dataset for analysis`,
    });
  };

  const handleRemove = (id: string) => {
    removeImportedDataset(id);
    toast({
      title: "Dataset Removed",
      description: "The imported dataset has been removed",
    });
  };

  return (
    <div className="space-y-6">
      {/* Source Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {importSources.map((source) => (
          <button
            key={source.id}
            onClick={() => setSelectedSource(source.id)}
            className={`
              p-4 rounded-lg border text-left transition-all
              ${selectedSource === source.id 
                ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }
            `}
          >
            <div className={`mb-2 ${selectedSource === source.id ? 'text-primary' : 'text-muted-foreground'}`}>
              {source.icon}
            </div>
            <p className="font-medium text-sm">{source.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{source.description}</p>
          </button>
        ))}
      </div>

      {/* Import Area */}
      <Card>
        <CardContent className="pt-6">
          {selectedSource === 'file' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {isImporting ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">Parsing and importing data...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="font-medium">Drop files here or click to upload</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Supports CSV, Excel, and JSON files
                    </p>
                    <div className="flex gap-2 justify-center mt-4">
                      <Badge variant="outline"><FileSpreadsheet className="h-3 w-3 mr-1" /> CSV</Badge>
                      <Badge variant="outline"><FileSpreadsheet className="h-3 w-3 mr-1" /> Excel</Badge>
                      <Badge variant="outline"><FileJson className="h-3 w-3 mr-1" /> JSON</Badge>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {selectedSource === 'google' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium">Google Sheets</p>
                  <p className="text-sm text-muted-foreground">Connect your Google account to import sheets</p>
                </div>
                <Button>
                  <Link2 className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Or paste a Google Sheets URL</Label>
                <div className="flex gap-2">
                  <Input placeholder="https://docs.google.com/spreadsheets/d/..." className="flex-1" />
                  <Button>Import</Button>
                </div>
              </div>
            </div>
          )}

          {selectedSource === 'api' && (
            <div className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>API Endpoint</Label>
                  <Input placeholder="https://api.example.com/data" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Method</Label>
                    <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                      <option>GET</option>
                      <option>POST</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Auth Type</Label>
                    <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                      <option>None</option>
                      <option>Bearer Token</option>
                      <option>API Key</option>
                    </select>
                  </div>
                </div>
                <Button className="w-full">Test Connection & Import</Button>
              </div>
            </div>
          )}

          {selectedSource === 'cloud' && (
            <div className="grid grid-cols-3 gap-3">
              {['Amazon S3', 'Azure Blob', 'Google Cloud'].map((provider) => (
                <button
                  key={provider}
                  className="p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-all text-center"
                >
                  <Cloud className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">{provider}</p>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Imported Datasets */}
      {importedDatasets.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">Imported Datasets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {importedDatasets.map((dataset) => (
                <div
                  key={dataset.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{dataset.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {dataset.importedAt.toLocaleDateString()} • {dataset.rowCount.toLocaleString()} rows • {dataset.columns.length} columns
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handlePreview(dataset)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleSetActive(dataset)}>
                      Use
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleRemove(dataset.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Data Preview: {previewDataset?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {previewDataset && (
              <Table>
                <TableHeader>
                  <TableRow>
                    {previewDataset.columns.slice(0, 10).map((col) => (
                      <TableHead key={col} className="whitespace-nowrap">{col}</TableHead>
                    ))}
                    {previewDataset.columns.length > 10 && (
                      <TableHead>+{previewDataset.columns.length - 10} more</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewDataset.data.slice(0, 20).map((row, idx) => (
                    <TableRow key={idx}>
                      {previewDataset.columns.slice(0, 10).map((col) => (
                        <TableCell key={col} className="max-w-[200px] truncate">
                          {String(row[col] ?? '')}
                        </TableCell>
                      ))}
                      {previewDataset.columns.length > 10 && (
                        <TableCell>...</TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {previewDataset && previewDataset.data.length > 20 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                Showing first 20 of {previewDataset.data.length} rows
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImportHub;
